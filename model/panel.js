/**
 * Created by cebbus on 16.03.2016.
 */
var mongoose = require('mongoose');

var panelSchema = mongoose.Schema({
    name: String,
    countryCode: String,
    cityCode: String,
    coordinates: Array,
    status: Boolean
});

mongoose.model('Panel', panelSchema);