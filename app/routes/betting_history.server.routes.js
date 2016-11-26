'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
	betting_history = require('../../app/controllers/betting_history.server.controller');

module.exports = function(app) {
	// BettingHistory Routes
	app.route('/betting_history')
		.post(users.requiresLogin, betting_history.create);
};
