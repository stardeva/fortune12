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
    /*
    * Create account
    */
    create_account: function (user_id) {
        if (!mongoose.Types.ObjectId.isValid(user_id)) {
            return false;
        }
        async.waterfall([
            function (cb) {
                var account = new Account({
                    coins: config.settings.new_user_coins,
                    user: user_id
                });

                account.save(function (err) {
                    if (err) {
                        return false;
                    } else {
                        cb(null, account);
                    }
                });
            },
            function (account, cb) {
                User.findOne({ _id: user_id }, '_id')
                .exec(function (err, user) {
                    if (err) {
                        return false;
                    } else {
                        user.account = account.id;
                        user.save(function (err) {
                            if (err) {
                                cb(err, null);
                            } else {
                                cb(null, user, account);
                            }
                        });
                    }
                });
            },
            function (user, account, cb) {
                if(module.exports.create_account_history(user.id, account.id, config.settings.new_user_coins, 'new user')) {
                    cb(null, account);
                } else {
                    cb(null, null);
                }
            }
        ], function (err, data) {
            return data;
        });
    },

    /*
    * update account
    */
    update_account: function(user_id, coins, description) {
        if (!mongoose.Types.ObjectId.isValid(user_id)) {
            return false;
        }
        async.waterfall([
            function (cb) {
                Account.findOne({ user: user_id })
                .exec(function (err, account) {
                    if (err) {
                        return false;
                    } else {
                        if(account.coins < Math.abs(coins)) {
                            cb(null, null);
                        } else {
                            account.coins += coins;
                            account.save(function (err) {
                                if (err) {
                                    cb(err, null);
                                } else {
                                    cb(null, account);
                                }
                            });
                        }
                    }
                });
            },
            function (account, cb) {
                if(module.exports.create_account_history(user_id, account.id, coins, description)) {
                    cb(null, account);
                } else {
                    cb(null, null);
                }
            }
        ], function(err, data) {
            return data;
        });
    },

    /*
    * create account history
    */
    create_account_history: function(user_id, account_id, coins, description) {
        var account_history = new AccountHistory({
            coins: coins,
            description: description,
            user: user_id,
            account: account_id
        });
        account_history.save(function (err) {
            if (err) {
                return false;
            } else {
                return account_history;
            }
        });
    }
};
