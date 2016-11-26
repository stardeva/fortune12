'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * BettingHistory Schema
 */
var BettingHistorySchema = new Schema({
	created: {
		type: Date,
		default: Date.now
	},
	betting_date: {
		type: String
	},
	round: {
		type: Number
    },
	level: {
		type: Number
	},
    value: {
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

mongoose.model('BettingHistory', BettingHistorySchema);
