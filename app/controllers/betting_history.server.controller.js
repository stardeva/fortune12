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
	Result = mongoose.model('Result'),
	AccountHistory = mongoose.model('AccountHistory'),
	account_helper = require('./../helpers/accounts.server.helper'),
	bettings_helper = require('./../helpers/bettings.server.helper');

/**
 * Create a betting history
 */
exports.create = function(req, res) {
	var user_id = req.user._id;
	var bettings = [];
	var round = config.settings.round;
	var betting_date = moment(config.settings.start_time).format('YYYY-MM-DD');
	if(req.body.bettings.length > 0) {
		_.each(req.body.bettings, function(betting) {
			if(betting.coins > 0) {
				var created = new Date();
				bettings.push(_.extend({
					betting_date: betting_date, 
					round: round, 
					user: user_id, 
					created: created, 
					account: req.user.account
				}, betting));
			}
		});
		if(config.settings.is_started) {
			if(bettings.length > 0) {
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
						if(account_coins >= total_betting_coins) {
							BettingHistory.collection.insert(bettings, function(err, docs) {
								if(err) {
									return res.status(400).send({
										message: errorHandler.getErrorMessage(err)
									});
								} else {
									// Update account
									account.coins -= total_betting_coins;
									account.save(function(err) {
										if(err) {
											return res.status(400).send({
												message: errorHandler.getErrorMessage(err)
											});
										} else {
											// Update account history
											var account_history = new AccountHistory({
												coins: total_betting_coins * (-1),
												description: 'Betting',
												user: user_id,
												account: account._id
											});
											account_history.save(function (err) {
												if (err) {
													return res.status(400).send({
														message: errorHandler.getErrorMessage(err)
													});
												} else {
													return res.json({status: 200, success: true, message: 'Saved successfully!'});
												}
											});
										}
									});
								}
							});
						} else {
							return res.json({status: 406, success: false, message: 'You don\'t have enough coins!'});
						}
					}
				});
			} else {
				return res.json({status: 406, success: false, message: 'No betting!'});
			}
		} else {
			return res.json({status: 406, success: false, message: 'betting end'});
		}
	} else {
		return res.json({status: 406, success: false, message: 'No betting!'});
	}
	
};

/**
 * Get betting result
 */
exports.get_betting_result = function(req, res) {
	var betting_date = moment(config.settings.start_time).format('YYYY-MM-DD');
    var round = config.settings.round;

	bettings_helper.update_accounts_after_betting({result: 1}, function(data) {

		res.json({status: 200, success: true, data: {result: data.result}});
		// Result.findOne({betting_date: betting_date, round: round})
		// .exec(function(err, result) {
		// 	if (err) {
		// 		return res.status(400).send({
		// 			message: errorHandler.getErrorMessage(err)
		// 		});
		// 	} else {
		// 		res.json({status: 200, success: true, data: {result: result.result_number}});
		// 	}
		// });
	});
};
