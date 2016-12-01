'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Result = mongoose.model('Result'),
    BettingHistory = mongoose.model('BettingHistory'),
    async = require('async'),
    config = require('./../../config/config'),
	_ = require('lodash'),
    bettings_helper = require('./../helpers/bettings.server.helper');

exports.get_latest_results_by_user_id = function(user_id, next) {
    Result.find().sort('-created').limit(10).exec(function(err, results) {
        if (err) {
			next([]);
		} else {
			var betting_history_callbacks = [];
            _.each(results, function(result) {
                betting_history_callbacks.push(function(cb) {
                    BettingHistory.find({betting_date: result.betting_date, round: result.round, user: user_id}).exec(cb);
                });
            });
            async.parallel(betting_history_callbacks, function (err, bettings) {
                var user_histories = [];
                _.each(bettings, function(betting_histories, index) {
                    var user_history = bettings_helper.calc_winning_coins(results[index].result_number, betting_histories, results[index].betting_rates);
                    user_history = _.extend(user_history, {
                        betting_date: results[index].betting_date,
                        round: results[index].round
                    });
                    user_histories.push(user_history);
                });
                next(user_histories);
            });
		}
    });
};
