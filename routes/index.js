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
        res.render('index', {message: ''});
    });

    //event

    //socket
    io.on('connection', function (socket) {

        var callBackForWithDate = function(err, paneldatas) {
            if(err) {
                console.error(err);
            }

            io.emit('addPanelDataList', !err ? paneldatas : []);
        };

        socket.on('retrievePanelDataWithDate', function (panelId, date, nextDate) {

            PanelData.find({
                panelId: panelId,
                date: {
                    $gte: date,
                    $lt: nextDate
                }
            }, callBackForWithDate).sort({date: 1});
        });
    });

    return router;
};
