'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Result Schema
 */
var ResultSchema = new Schema({
	created: {
		type: Date,
		default: Date.now
	},
    round: {
        type: Number
    },
	betting_coins: {
		type: Number
	},
	betting_rate: {
		type: Number
	},
    coins: {
        type: Number
    },
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Result', ResultSchema);
