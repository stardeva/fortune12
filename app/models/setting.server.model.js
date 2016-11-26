'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Setting Schema
 */
var SettingSchema = new Schema({
	new_user_coins: {
        type: Number
    },
    min_betting: {
        type: Number
    },
    max_betting: {
        type: Number
    },
    user_invite_coins: {
        type: Number
    },
    agent_invite_coins: {
        type: Number
    },
    betting_rates: {
		type: [{
			type: Number
		}]
	},
    round_time: {
        type: Number
    },
    betting_time: {
        type: Number
    },
    betting_result_mode: {
        type: Number
    },
    betting_result_value: {
        type: Number
    },
    start_time: {
        type: Date
    },
    round: {
        type: Number
    },
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date
    }
});

mongoose.model('Setting', SettingSchema);
