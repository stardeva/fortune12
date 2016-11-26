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
	betting_date: {
		type: String
	},
    round: {
        type: Number
    },
	result_number: {
		type: Number
	},
	betting_rates: {
		type: [{
			type: Number
		}]
	}
});

mongoose.model('Result', ResultSchema);
