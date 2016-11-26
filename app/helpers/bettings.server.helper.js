'use strict';

var _ = require('lodash'),
    moment = require('moment'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    config = require('../../config/config'),
    async = require('async'),
    BettingHistory = mongoose.model('BettingHistory'),
    Random = require('random-js'),
    account_helper = require('./accounts.server.helper');

var random = new Random(Random.engines.mt19937().autoSeed());

module.exports = {
    /*
    * Calc round result
    */
    calc_round_result: function() {
        var betting_mode = config.settings.betting_result_mode;
        var betting_ratings = config.settings.betting_rates;
        var result_number = 0;
        var level_numbers = {
            1: {
                0: [2, 4, 6],
                1: [1, 3, 5],
                2: [8, 10, 12],
                3: [7, 9, 11],
            },
            2: {
                0: [2, 4, 6, 8, 10, 12],
                1: [1, 3, 5, 7, 9, 11],
                2: [1, 2, 3, 4, 5, 6],
                3: [2, 4, 6, 8, 10, 12]
            }
        };
        if(betting_mode == 1) {
            // Random mode
            result_number = random.integer(1, 12);
        } else if(betting_mode == 2) {
            // Manual mode
            result_number = config.settings.betting_result_value;
        } else {
            // Minimal mode
            var betting_date = moment(config.settings.start_time).format('YYYY-MM-DD');
            var round = moment(config.settings.round);
            var totals = _.fill(Array(13), 0);
            
            BettingHistory.find({
                betting_date: betting_date,
                round: round
            }).exec(function(err, list) {
                if (err) {
                    return false; 
                } else {
                    if(list.length > 0) {
                        _.each(list, function(betting) {
                            if(betting.level == 0) {
                                totals[betting.value] += betting.value * betting_ratings[0];
                            } else {
                                _.each(level_numbers[betting.level][betting.value], function(number) {
                                    totals[number] += betting.value * betting_ratings[betting.level];
                                });
                            }
                        });
                        var first = Number.MAX_VALUE, second = Number.MAX_VALUE;
                        for(i = 1; i < totals.length; i++) {
                            if(totals[i] < first) {
                                second = first;
                                first = totals[i];
                            } else if(totals[i] < second && totals[i] != first) {
                                second = totals[i];
                            }
                        }
                        if(second == Number.MAX_VALUE) second = first;
                        var shuffle_box = [];
                        for(i = 1; i < totals.length; i++) {
                            if(totals[i] <= second) {
                                shuffle_box.push(i);
                            }
                        }
                        if(shuffle_box.length == 0) {
                            result_number = random.integer(1, 12);
                        } else {
                            result_number = random.picker(shuffle_box);
                        }
                    } else {
                        result_number = random.integer(1, 12);
                    }
                }
            });
        }
        if(result_number != 0) {
            BettingHistory.find({
                betting_date: betting_date,
                round: round
            })
            .exec(function(err, list) {
                _.each(list, function(betting) {
                    var coins = Math.floor(betting.value * betting_ratings[betting.level]);
                    account_helper.update_account(betting.user, coins, 'Betting Prize');
                });
            });
            return result_number;
        }
        return false;
    }
};
