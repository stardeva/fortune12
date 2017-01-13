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
    },
    get_account_purchase_history: function(account_id, next) {
        AccountHistory.find({
            type: 'purchase',
            account: account_id
        })
        .sort('-created')
        .select('-_id coins cost created')
        .exec(function(err, history) {
            if (err) {
                next(err, null);
            } else {
                next(null, history);
            }
        });
    },
    create_account: function(user, next) {
        var new_user_coins = config.settings.new_user_coins;
        var account = new Account({coins: new_user_coins, user: user});
        account.save(function(err) {
            if(err) next(err, null);
            else {
                module.exports.create_account_history(user, account, new_user_coins, 'new', 'New user', null, function(err, data) {
                    if (err) {
                        next(err, null);
                    } else {
                        next(null, account);
                    }
                });
            }
        });
    }
};
