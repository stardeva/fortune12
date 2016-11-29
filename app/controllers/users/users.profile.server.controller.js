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
				}
			}
			res.json(result);
		}
	})
};
