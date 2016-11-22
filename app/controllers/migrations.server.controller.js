'use strict';
/* jshint ignore:start */
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Setting = mongoose.model('Setting'),
    _ = require('lodash'),
    async = require('async'),   
    settings = require('./../migrates/settings.json');

exports.index = function(req, res) {
  async.waterfall([
    function(cb) {
      async.each(settings, function(setting, callback) {
        var s;
        Setting.findOne({}, function(err, obj) {
          s = obj;
          if(!s) {
            s = new Setting(setting);
          } else {
            s = _.extend(obj, setting);
          }
          s.save(function(err) {
            if(err) {
              callback(err);
            } else {
              callback();
            }
          });
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