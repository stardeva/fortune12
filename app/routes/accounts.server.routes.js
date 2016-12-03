'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
	accounts = require('../../app/controllers/accounts.server.controller');

module.exports = function(app) {
	// Accounts Routes
	app.route('/accounts/purchase/:userId')
		.get(users.requiresLogin, accounts.accountByUserID, accounts.get_purchase_history)
		.post(users.requiresLogin, accounts.accountByUserID, accounts.purchase);

	// Finish by binding the users middleware
	app.param('userId', users.userByID);
};
