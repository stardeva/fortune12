'use strict';
/* jshint ignore:start */
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    User = mongoose.model('User'),
    Setting = mongoose.model('Setting'),
    _ = require('lodash'),
    async = require('async'),
    users = require('./../migrates/users.json'),
    settings = require('./../migrates/settings.json');

exports.index = function(req, res) {
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
            })
          } else {
            callback();
          }
        });
      }, function(err) {
        cb(null, null);
      })
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
    }
  ], function(err, data) {
    res.json(200);
  });
}
/* jshint ignore:end */