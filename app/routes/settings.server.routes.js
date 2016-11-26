'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
	settings = require('../../app/controllers/settings.server.controller');

module.exports = function(app) {
	// Settings Routes

	app.route('/settings/:userId')
		.get(users.requiresLogin, settings.read)
		;

	// Finish by binding the user middleware
	app.param('userId', users.userByID);
};
