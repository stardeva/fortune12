'use strict';

var _ = require('lodash'),
    moment = require('moment'),
    PUSH = require('../helpers/push_notifications.server.helper');

module.exports = function(app) {
  var betting_end = function(app) {
    console.log('Betting end');
    // PUSH.push_notifications('Betting end', 'Betting end', {});
  };

  var game_round = function(app) {
    console.log('Round start');
    app.config.settings.start_time = new Date();
    setTimeout(betting_end, app.config.settings.betting_time * 60000, app);
    // PUSH.push_notifications('Round start', 'Round start', {});
    setTimeout(game_round, app.config.settings.round_time * 60000, app);
  };

  game_round(app);
};
