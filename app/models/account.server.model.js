'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Account Schema
 */
var AccountSchema = new Schema({
	created: {
		type: Date,
		default: Date.now
	},
	coins: {
		type: Number
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Account', AccountSchema);
