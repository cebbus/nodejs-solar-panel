/**
 * Created by cebbus on 17.03.2016.
 */
var mongoose = require('mongoose');

var panelDataSchema = mongoose.Schema({
    panelId: mongoose.Schema.Types.ObjectId,
    current: Number,
    voltage: Number,
    light: Number,
    temperature: Number,
    moisture: Number,
    date: Date
});

mongoose.model('PanelData', panelDataSchema);