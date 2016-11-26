'use strict';

var _ = require('lodash'),
    moment = require('moment'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Setting = mongoose.model('Setting'),
    _ = require('lodash'),
    async = require('async'),
    users = require('./users.json'),
    settings = require('./settings.json');

module.exports = function(app, cbk) {
  async.waterfall([
    function(cb) {
      async.each(users, function(user, callback) {
        var u;
        User.findOne()
        .exec(function(err, obj) {
          u = obj;
          if(!u) {
            u = new User(user);
            u.save(function(err) {
              if(err) {
                callback(err);
              } else {
                callback();
              }
            });
          } else {
            callback();
          }
        });
      }, function(err) {
        cb(null, null);
      });
    },
    function(data, cb) {
      async.each(settings, function(setting, callback) {
        var s;
        Setting.findOne()
        .exec(function(err, obj) {
          s = obj;
          if(!s) {
            s = new Setting(setting);
            s.save(function(err) {
              if(err) {
                callback(err);
              } else {
                callback();
              }
            });
          } else {
            callback();
          }
        });
      }, function(err) {
        cb(null, null);
      });
    },
    function(data, cb) {
      Setting.findOne()
      .exec(function(err, setting) {
        if(err) {
          cb(err, null);
        } else {
          setting.created = undefined;
          setting.updated = undefined;
          app.config.settings = setting;
          cb(null, null);
        }
      });
    }
  ], function(err, data) {
    cbk();
  });
};
