'use strict';

var _ = require('lodash'),
    moment = require('moment'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    config = require('../../config/config'),
    async = require('async'),
    Account = mongoose.model('Account'),
    AccountHistory = mongoose.model('AccountHistory');

module.exports = {
    create_account_history: function(user, account, coins, type, description, cost, next) {
        var account_history = new AccountHistory({
            coins: coins,
            old_coins: account.coins - coins,
            new_coins: account.coins,
            type: type,
            description: description,
            cost: cost,
            user: user._id,
            account: account._id
        });
        account_history.save(next);
    }
};
