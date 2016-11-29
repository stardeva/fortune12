'use strict';

var _ = require('lodash'),
    moment = require('moment'),
    mongoose = require('mongoose'),
    config = require('../../config/config'),
    bettings_helper = require('./../helpers/bettings.server.helper'),
    Result = mongoose.model('Result'),
    Setting = mongoose.model('Setting'),
    PUSH = require('../helpers/push_notifications.server.helper');

module.exports = function (app) {
    var betting_end = function (app) {
        console.log('Betting end');
        PUSH.push_notifications('Betting end', 'Betting end', {"type": "2"});
        config.settings.is_started = false;
        setTimeout(calc_betting_result, 10000, app);
    };

    var calc_betting_result = function(app) {
        bettings_helper.calc_round_result(function (data) {
            var betting_date = moment().format('YYYY-MM-DD');
            var round = config.settings.round;
            var betting_rates = config.settings.betting_rates;
            var result = new Result({betting_date: betting_date, round: round, result_number: data.result, betting_rates: betting_rates});
            result.save(function (err) {
                if (!err) {
                    bettings_helper.update_accounts_after_betting(data, function(res) {
                        if(!res.result) {
                            console.log('Result');
                            PUSH.push_notifications('Betting result', 'Betting result', {"type": "3", "result": data.result});
                        }
                    });
                }
            });
        });
    };

    var game_round = function (app) {
        console.log('Round start');
        config.settings.start_time = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
        config.settings.is_started = true;
        config.settings.round += 1;
        Setting.findOne()
        .exec(function(err, setting) {
            setting.round = config.settings.round;
            setting.betting_date = moment().format('YYYY-MM-DD');
            setting.start_time = config.settings.start_time;
            setting.save(function(err) {
                if(!err) {
                    setTimeout(betting_end, config.settings.bidding_time * 60000, app);
                    PUSH.push_notifications('Round start', 'Round start', {"type": "1"});
                    setTimeout(game_round, config.settings.round_time * 60000, app);
                }
            });
        });
    };

    game_round(app);
};
