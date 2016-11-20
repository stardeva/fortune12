'use strict';

var _ = require('lodash'),
    moment = require('moment'),
    config = require('../../config/config'),
    ALY = require('aliyun-sdk');

module.exports = function(app) {
  var push = new ALY.PUSH({
        accessKeyId: config.aliyun.accessKeyId,
        secretAccessKey: config.aliyun.secretAccessKey,
        endpoint: config.aliyun.endpoint,
        apiVersion: config.aliyun.apiVersion
      }
  );

  var betting_end = function(app) {
    console.log('Betting end');
    // push.pushNoticeToiOS({
    //   AppKey: config.aliyun.appKey,
    //   Env: 'DEV',
    //   Target: 'all',
    //   TargetValue: 'all',
    //   Summary: 'Betting end',
    //   Ext:'{"sound":"default", "badge": "24"}'
    // }, function (err, res) {
    //   console.log(err, res);
    // });
  };

  var game_round = function(app) {
    console.log('Round start');
    config.betting.start_time = new Date();
    setTimeout(betting_end, config.betting.betting_time * 60000, app);
    // push.pushNoticeToiOS({
    //   AppKey: config.aliyun.appKey,
    //   Env: 'DEV',
    //   Target: 'all',
    //   TargetValue: 'all',
    //   Summary: 'Round start',
    //   Ext:'{"sound":"default", "badge": "24"}'
    // }, function (err, res) {
    //   console.log(err, res);
    // });
    setTimeout(game_round, config.betting.round_time * 60000, app);
  };

  game_round(app);
};
