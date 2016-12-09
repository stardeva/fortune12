'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	moment = require('moment'),
	errorHandler = require('../errors.server.controller.js'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User'),
	Account = mongoose.model('Account'),
	results_helper = require('../../helpers/results.server.helper'),
	accounts_helper = require('../../helpers/accounts.server.helper'),
	config = require('../../../config/config');

/**
 * Update user details
 */
exports.update = function(req, res) {
	// Init Variables
	var user = req.user;
	var message = null;

	// For security measurement we remove the roles from the req.body object
	delete req.body.roles;

	if (user) {
		// Merge existing user
		user = _.extend(user, req.body);
		user.updated = Date.now();
		user.displayName = user.firstName + ' ' + user.lastName;

		user.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				req.login(user, function(err) {
					if (err) {
						res.status(400).send(err);
					} else {
						res.json(user);
					}
				});
			}
		});
	} else {
		res.status(400).send({
			message: 'User is not signed in'
		});
	}
};

/**
 * Send User
 */
exports.me = function(req, res) {
	res.json(req.user || null);
};

/**
 * Get full info
 */
exports.get_full_info = function(req, res) {
	var user = req.user;
	Account.findById(user.account)
	.exec(function(err, account) {
		if (err) {
			return res.status(404).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		if (!account) {
			return res.status(404).send({
				message: 'Account not found'
			});
		} else {
			results_helper.get_latest_results_by_user_id(user._id, function(result_history) {
				accounts_helper.get_account_purchase_history(account._id, function(err, account_history) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					} else {
						var settings = config.settings;
						var start_time = moment(settings.start_time);
						var current_time = moment();
						var played_time = current_time.diff(start_time, 'seconds');
						var result = {
							user: {
								firstName: user.firstName,
								lastName: user.lastName,
								displayName: user.displayName,
								username: user.username,
								roles: user.roles,
								email: user.email
							},
							account: {
								coins: account.coins
							},
							settings: {
								min_betting: settings.min_betting,
								max_betting: settings.max_betting,
								round_time: settings.round_time,
								bidding_time: settings.bidding_time,
								round: settings.round,
								played_time: played_time
							},
							result_history: result_history,
							account_history: account_history
						};
						res.json(result);
					}
				});
			});
		}
	});
};
