'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Account = mongoose.model('Account'),
	AccountHistory = mongoose.model('AccountHistory'),
    config = require('./../../config/config'),
	accounts_helper = require('./../helpers/accounts.server.helper'),
	_ = require('lodash');

/**
 * Save user's purchased coins
 */
exports.purchase = function(req, res) {
    var account = req.account;
    account.coins += req.body.coins;

	account.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			accounts_helper.create_account_history(req.user, account, req.body.coins, 'purchase', 'Purchase coins', req.body.cost, function(err, data) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					res.json(account);
				}
			});
		}
	});
};

/**
 * Get User's purchase history
 */
exports.get_purchase_history = function(req, res) {
	var account = req.account;
	accounts_helper.get_account_purchase_history(account._id, function(err, account_history) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(account_history);
		}
	});
};

/**
 * Account middleware
 */
exports.accountByUserID = function(req, res, next) {
	Account.findOne({user: req.user._id}).exec(function(err, account) {
		if (err) return next(err);
		if (!account) {
			return res.status(404).send({
				message: 'Account not found'
			});
		}
		req.account = account;
		next();
	});
};
