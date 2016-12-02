'use strict';

var _ = require('lodash'),
    moment = require('moment'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    config = require('../../config/config'),
    async = require('async'),
    BettingHistory = mongoose.model('BettingHistory'),
    AccountHistory = mongoose.model('AccountHistory'),
    Account = mongoose.model('Account'),
    Random = require('random-js'),
    Result = mongoose.model('Result'),
    account_helper = require('./accounts.server.helper');

var random = new Random(Random.engines.mt19937().autoSeed());

module.exports = {
    /*
    * Calc round result
    */
    calc_round_result: function(next) {
        var betting_mode = config.settings.betting_result_mode;
        var betting_rates = config.settings.betting_rates;
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
        var betting_date = moment(config.settings.start_time).format('YYYY-MM-DD');
        var round = config.settings.round;
        if(betting_mode === 1) {
            // Random mode
            result_number = random.integer(1, 12);
            next({result: result_number});
        } else if(betting_mode === 2) {
            // Manual mode
            result_number = config.settings.betting_result_value;
            next({result: result_number});
        } else {
            // Minimal mode
            BettingHistory.find({
                betting_date: betting_date,
                round: round
            }).exec(function(err, list) {
                if (!err) {
                    if(list.length > 0) {
                        var totals = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                        _.each(list, function(betting) {
                            if(betting.level === 0) {
                                totals[betting.value] += betting.coins * betting_rates[0];
                            } else {
                                _.each(level_numbers[betting.level][betting.value], function(number) {
                                    totals[number] += betting.coins * betting_rates[betting.level];
                                });
                            }
                        });
                        var first = Number.MAX_VALUE, second = Number.MAX_VALUE;
                        for(var i = 1; i < totals.length; i++) {
                            if(totals[i] < first) {
                                second = first;
                                first = totals[i];
                            } else if(totals[i] < second && totals[i] !== first) {
                                second = totals[i];
                            }
                        }
                        if(second === Number.MAX_VALUE) second = first;
                        var shuffle_box = [];
                        for(i = 1; i < totals.length; i++) {
                            if(totals[i] <= second) {
                                shuffle_box.push(i);
                            }
                        }
                        if(shuffle_box.length > 0) {
                            result_number = random.pick(shuffle_box);
                        }
                    }
                }
                if(result_number === 0) {
                    result_number = random.integer(1, 12);
                }
                next({result: result_number});
            });
        }
    },
    update_accounts_after_betting: function(data, next) {
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
        var betting_date = moment(config.settings.start_time).format('YYYY-MM-DD');
        var round = config.settings.round;
        var betting_rates = config.settings.betting_rates;
        BettingHistory.find({
            betting_date: betting_date,
            round: round
        })
        .populate('account')
        .exec(function(err, list) {
            if (!err) {
                if(list.length > 0) {
                    var update_account_callbacks = [], accounts = {};
                    _.each(list, function(betting) {
                        if((betting.level === 0 && betting.value === data.result) || 
                            ((betting.level === 1 || betting.level === 2) && 
                            (_.includes(level_numbers[betting.level][betting.value], data.result))
                        )) {
                            var account = betting.account;
                            var coins = Math.floor(betting_rates[betting.level] * betting.coins) + betting.coins;
                            if(!accounts.hasOwnProperty(account._id)) {
                                accounts[account._id] = {account: account, coins: coins};
                            } else {
                                accounts[account._id].coins += coins;
                            }
                        }
                    });
                    _.each(accounts, function(data) {
                        update_account_callbacks.push(function(cb) {
                            var account = data.account;
                            var coins = data.coins;
                            account.coins += coins;
                            account.save(cb(err, {account: account, coins: coins}));
                        });
                    });
                    async.parallel(update_account_callbacks, function (err, results) {
                        var update_account_history_callbacks = [];
                        _.each(results, function(data) {
                            update_account_history_callbacks.push(function(done) {
                                var account_history = new AccountHistory({
                                    coins: data.coins,
                                    description: 'Betting Prize',
                                    user: data.account.user,
                                    account: data.account._id
                                });
                                account_history.save(done(err, {success: true}));
                            });
                        });
                        async.parallel(update_account_history_callbacks, function (err, results) {
                            next({result: data.result});
                        });
                    });
                } else {
                    next({result: false});
                }
            } else {
                next({result: false});
            }
        });
    },
    calc_winning_coins: function(result, data, rates) {
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
        var betting_coins = 0, winning_coins = 0;
        _.each(data, function(betting) {
            if((betting.level === 0 && betting.value === result) || 
                ((betting.level === 1 || betting.level === 2) && 
                (_.includes(level_numbers[betting.level][betting.value], result))
            )) {
                betting_coins += betting.coins;
                winning_coins += Math.floor(rates[betting.level] * betting.coins) + betting.coins;
            }
        });
        return { betting_coins: betting_coins, winning_coins: winning_coins };
    }
};
