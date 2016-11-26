'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'), 
	mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	BettingHistory = mongoose.model('BettingHistory'),
	account_helper = require('./../helpers/accounts.server.helper');
	

/**
 * Create a betting history
 */
exports.create = function(req, res) {
	var betting_history = new BettingHistory(req.body);

	betting_history.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			var coins = req.body.coins * (-1);
			var account = account_helper.update_account(req.body.user_id, coins, 'betting');
 			res.json(betting_history);
		}
	});
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
