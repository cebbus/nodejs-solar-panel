/**
 * Created by cebbus on 15.03.2016.
 */
var properties = require('../properties');
var mongoose = require('mongoose');

var dbProp = properties.db;

var dbURI = 'mongodb://';
if(dbProp.username && dbProp.password) {
    dbURI += dbProp.username + ':' + dbProp.password + '@';
}

dbURI += dbProp.server + ':' + dbProp.port + '/' + dbProp.database;

mongoose.connect(dbURI);

mongoose.connection.on('connected', function () {
    console.log('Mongoose default connection open to ' + dbURI);
});

mongoose.connection.on('error',function (err) {
    console.log('Mongoose default connection error: ' + err);
});

mongoose.connection.on('disconnected', function () {
    console.log('Mongoose default connection disconnected');
});

process.on('SIGINT', function() {
    mongoose.connection.close(function () {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});

require('../model/panel');
require('../model/panelData');