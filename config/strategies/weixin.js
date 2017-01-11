'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
	CustomStrategy = require('passport-custom').Strategy,
	config = require('../config'),
	users = require('../../app/controllers/users.server.controller');

module.exports = function() {
	// Use weixin strategy
	passport.use('weixin', new CustomStrategy(
		function(req, done) {
			// Set the provider data and include tokens
            var profile = {
                "displayName": req.body.nickname,
                "avatar": req.body.avatar,
                "username": req.body.unionId,
                "id": req.body.unionId
            };
			var providerData = profile;

			// Create the user OAuth profile
			var displayName = profile.displayName.trim();
			var iSpace = displayName.indexOf(' '); // index of the whitespace following the firstName
			var firstName =  iSpace !== -1 ? displayName.substring(0, iSpace) : displayName;
			var lastName = iSpace !== -1 ? displayName.substring(iSpace + 1) : '';

			var providerUserProfile = {
				firstName: firstName,
				lastName: lastName,
				displayName: displayName,
				username: profile.username,
				avatar: profile.avatar,
				provider: 'weixin',
				providerIdentifierField: 'id',
				providerData: providerData
			};

			// Save the user OAuth profile
			users.saveOAuthUserProfile(req, providerUserProfile, done);
		}
	));
};
