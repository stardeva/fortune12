'use strict';

var mongoose = require('mongoose'),
    Setting = mongoose.model('Setting'),
    config = require('./config');

module.exports = function(next) {
    Setting.findOne()
    .exec(function (err, setting) {
        if (err) {
            next(err);
        } else {
            setting.created = undefined;
            setting.updated = undefined;
            config.settings = setting.toObject();
            next();
        }
    });
};
