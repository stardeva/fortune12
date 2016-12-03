'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
	betting_history = require('../../app/controllers/betting_history.server.controller');

module.exports = function(app) {
	// BettingHistory Routes
	app.route('/betting_history/new/:userId')
		.post(users.requiresLogin, betting_history.create);
	app.route('/betting_result')
		.get(users.requiresLogin, betting_history.get_betting_result);

	// Finish by binding the user middleware
	app.param('userId', users.userByID);
};
