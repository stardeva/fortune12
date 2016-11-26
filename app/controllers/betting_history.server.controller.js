'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'), 
	moment = require('moment'),
	mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	config = require('./../../config/config'),
	BettingHistory = mongoose.model('BettingHistory'),
	Account = mongoose.model('Account'),
	account_helper = require('./../helpers/accounts.server.helper');

/**
 * Create a betting history
 */
exports.create = function(req, res) {
	var betting_date = moment().format('YYYY-MM-DD');
	var user_id = req.body.user_id;
	var bettings = req.body.bettings;

	if(config.settings.is_started) {
		Account.findOne({ user: user_id })
		.exec(function (err, account) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				var account_coins = account.coins;
				var total_betting_coins = _.reduce(bettings, function(sum, betting) {
					return sum + betting.coins;
				}, 0);
				var round = config.settings.round;
				var betting_date = moment(config.settings.start_time).format('YYYY-MM-DD');
				if(account_coins >= total_betting_coins) {
					_.each(bettings, function(betting) {
						var data = _.extend({betting_date: betting_date, round: round}, betting);
						data.user = user_id;
						var betting_history = new BettingHistory(data);
						betting_history.save();
					});
					account.coins -= total_betting_coins;
					account.save();
					account_helper.create_account_history(user_id, account.id, total_betting_coins*(-1), "Betting");
					res.json({status: 200, success: true, message: "Saved successfully!"});
				} else {
					res.json({status: 406, success: false, message: "You don't have enough coins!"});
				}
			}
		});
	} else {
		res.json({status: 406, success: false, message: 'betting end'});
	}

	// _.each(req.body, function(value) {
		
	// });
	// res.json({status: 200, success: 'ok'});
};

/**
 * BettingHistory middleware
 */


/**
 * BettingHistory authorization middleware
 */
// exports.hasAuthorization = function(req, res, next) {
// 	if (req.betting_history.user.id !== req.user.id) {
// 		return res.status(403).send({
// 			message: 'User is not authorized'
// 		});
// 	}
// 	next();
// };
