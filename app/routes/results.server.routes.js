'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
	results = require('../../app/controllers/results.server.controller');

module.exports = function(app) {
	// Results Routes

	app.route('/results/history/:userId')
		.get(users.requiresLogin, results.get_results_by_user_id)
		;

	// Finish by binding the user middleware
	app.param('userId', users.userByID);
};
