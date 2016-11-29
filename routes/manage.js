/**
 * Created by cebbus on 15.03.2016.
 */
module.exports = function(io) {
    var express = require('express');
    var mongoose = require('mongoose');
    var events = require('events');

    //db
    var Panel = mongoose.model('Panel');
    var PanelData = mongoose.model('PanelData');

    //route
    var router = express.Router();

    router.get('/', function (req, res, next) {
        res.render('manage', {message: ''});
    });

    //event
    var manager = new events.EventEmitter();
    var creationStatus = false;
    var sendPanelData = null;

    var pDM = new function () {
        this.panelMap = {};
        this.timer = '';

        this.setPanelMap = function(panelList){
            this.panelMap = {};

            for(var i = 0; i < panelList.length; i++) {
                if(!panelList[i].status) continue;

                this.panelMap[panelList[i]._id] = panelList[i].status;
            }
        };

        this.managePanel = function(panel){
            this.panelMap[panel._id] = panel.status;
        };

        this.removePanel = function(panel){
            this.panelMap[panel._id] = undefined;
        };

        this.startDataCreate = function() {
            var me = this;
            this.timer = setInterval(function(){
                for (key in me.panelMap) {
                    if (me.panelMap.hasOwnProperty(key)
                        && me.panelMap[key]) {

                        var newPanelData = new PanelData({
                            panelId: key,
                            current: parseInt(Math.random()*1000),
                            voltage: parseInt(Math.random()*1000),
                            light: parseInt(Math.random()*100),
                            temperature: parseInt(Math.random()*100),
                            moisture: parseInt(Math.random()*100),
                            date: new Date()
                        });

                        newPanelData.save(function(err){
                            if(err) {
                                console.error(err);
                            }
                        });

                        io.emit('retrievePanelData', newPanelData);
                    }
                }
            }, 1000);

            creationStatus = true;
        };

        this.stopDataCreate = function() {
            clearInterval(this.timer);

            creationStatus = false;
        };
    };

    /*
    function getNow() {
        var d = new Date();

        return new Date(
            (d.getTime()) +
            (d.getTimezoneOffset() * 60000) +
            (3600000 * 5)
        );
    }
    */

    manager.on('setPanelMap', pDM.setPanelMap);
    manager.on('managePanel', pDM.managePanel);
    manager.on('removePanel', pDM.removePanel);
    manager.on('startDataCreate', pDM.startDataCreate);
    manager.on('stopDataCreate', pDM.stopDataCreate);

    //socket
    io.on('connection', function (socket) {

        socket.on('retrievePanelList', function(page, setMap) {
            sendPanelList(page, setMap);
        });

        socket.on('addPanelData', function(data) {
            var newPanelData = new PanelData({
                panelId: data.id,
                current: data.current,
                voltage: data.voltage,
                light: data.light,
                temperature: data.temperature,
                moisture: data.moisture,
                date: data.date
            });

            newPanelData.save(function(err){
                if(err) {
                    console.error(err);
                }
            });
        });

        socket.on('addPanel', function(panel) {
            var newPanel = new Panel(panel);

            newPanel.save(function(err){
                if(err) {
                    console.error(err);
                } else {
                    manager.emit('managePanel', newPanel);
                }

                sendPanelList();
            });
        });

        socket.on('editPanel', function(panel) {
            Panel.findById(panel._id, function(err, p){
                if(err) {
                    console.error(err);
                } else {
                    p.name = panel.name;
                    p.countryCode = panel.countryCode;
                    p.cityCode = panel.cityCode;
                    p.coordinates = panel.coordinates;
                    p.status = panel.status;

                    p.save(function(err){
                        if(err) {
                            console.error(err);
                        } else {
                            manager.emit('managePanel', p);
                        }

                        sendPanelList();
                    });
                }
            });
        });

        socket.on('removePanel', function(panel) {
            Panel.find({_id:panel._id}).remove(function(err){
                if(err) {
                    console.error(err);
                } else {
                    PanelData.find({panelId:panel._id}).remove(function(err){
                        if(err) {
                            console.error(err);
                        }
                    });

                    manager.emit('removePanel', panel);
                }

                sendPanelList();
            });
        });

        socket.on('startDataCreate', function(){
            manager.emit('startDataCreate');
        });

        socket.on('stopDataCreate', function(){
            manager.emit('stopDataCreate');
        });

        socket.on('checkCreationStatus', function(){
            io.emit('checkCreationStatus', creationStatus);
        });

        function sendPanelList(page, addToManager) {
            if(!page) {
                page = 1;
            }

            Panel.find({}, function(err, panels) {
                if(err) {
                    console.error(err);
                }

                io.emit('retrievePanelList', !err ? panels : []);

                if(addToManager) {
                    manager.emit('setPanelMap', !err ? panels : []);
                }
            });
        }
    });

    return router;
};
