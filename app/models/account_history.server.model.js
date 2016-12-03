'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * AccountHistory Schema
 */
var AccountHistorySchema = new Schema({
	created: {
		type: Date,
		default: Date.now
	},
    coins: {
        type: Number
    },
	type: {
		type: String
	},
    description: {
        type: String
    },
	old_coins: {
		type: Number
	},
	new_coins: {
		type: Number
	},
	cost: {
		type: Number
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
    account: {
		type: Schema.ObjectId,
		ref: 'Account'
	}
});

mongoose.model('AccountHistory', AccountHistorySchema);
