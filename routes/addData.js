/**
 * Created by cebbus on 13.06.2016.
 */
module.exports = function(io) {
    var express = require('express');
    var mongoose = require('mongoose');
    var url = require('url');

    //db
    var Panel = mongoose.model('Panel');
    var PanelData = mongoose.model('PanelData');

    //route
    var router = express.Router();
    router.get('/', function (req, res, next) {

        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;

        console.log('talep geldi');

        var newPanelData = new PanelData({
            panelId: "575ddb75894fac5646cfe05c",
            current: query.current,
            voltage: query.voltage,
            light: query.light,
            temperature: query.temperature,
            moisture: query.moisture,
            date: query.date
        });

        newPanelData.save(function(err){
            if(err) {
                console.error(err);
            } else {
                console.log('veri kaydedildi');
            }
        });

        console.log('talebe cevap verildi');

        res.render('addData', {message: ''});
    });

    //event

    //socket
    io.on('connection', function (socket) {

    });

    return router;
};
