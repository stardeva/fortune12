'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Setting = mongoose.model('Setting'),
    config = require('./../../config/config'),
	_ = require('lodash');

/**
 * Get current settings
 */
exports.read = function(req, res) {
    res.json({ settings: config.settings });
}; 
