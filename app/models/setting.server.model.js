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
	new_user_coin: {
        type: Number
    },
    min_betting: {
        type: Number
    },
    max_betting: {
        type: Number
    },
    user_invite_coin: {
        type: Number
    },
    agent_invite_coin: {
        type: Number
    },
    level_0_rates: {
        type: Number
    },
    level_1_rates: {
        type: Number
    },
    level_2_rates: {
        type: Number
    },
    round_time: {
        type: Number
    },
    betting_time: {
        type: Number
    },
    betting_result_mode: {
        type: String
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
    }
});

mongoose.model('Setting', SettingSchema);
