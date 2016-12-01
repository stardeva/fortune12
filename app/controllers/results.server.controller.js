'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Setting = mongoose.model('Setting'),
    Result = mongoose.model('Result'),
    BettingHistory = mongoose.model('BettingHistory'),
    async = require('async'),
    config = require('./../../config/config'),
	_ = require('lodash'),
    bettings_helper = require('./../helpers/bettings.server.helper'),
    results_helper = require('./../helpers/results.server.helper');

/**
 * Get latest 10 user's history
 */
exports.get_results_by_user_id = function(req, res) {
    var user = req.user;
    results_helper.get_latest_results_by_user_id(user._id, function(history) {
        res.json(history);
    });
};
