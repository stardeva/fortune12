'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Setting = mongoose.model('Setting'),
    async = require('async'),
    users = require('./users.json'),
    settings = require('./settings.json');

module.exports = function (app, cbk) {
    async.waterfall([
        function (cb) {
            async.each(users, function (user, callback) {
                u = new User(user);
                u.save(function (err) {
                    if (err) {
                        callback(err);
                    } else {
                        callback();
                    }
                });
            }, function (err) {
                cb(null, null);
            });
        },
        function (data, cb) {
            async.each(settings, function (setting, callback) {
                s = new Setting(setting);
                s.save(function (err) {
                    if (err) {
                        callback(err);
                    } else {
                        callback();
                    }
                });
            }, function (err) {
                cb(null, null);
            });
        }
    ], function (err, data) {
        cbk();
    });
};
