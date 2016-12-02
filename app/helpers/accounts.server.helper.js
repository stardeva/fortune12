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
                        user.account = account._id;
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
                if(module.exports.create_account_history(user._id, account._id, config.settings.new_user_coins, 'new user')) {
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
                        account.coins += coins;
                        account.save(function (err) {
                            if (err) {
                                cb(err, null);
                            } else {
                                cb(null, account);
                            }
                        });
                    }
                });
            },
            function (account, cb) {
                if(module.exports.create_account_history(user_id, account._id, coins, description)) {
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
        console.log('history');
        var account_history = new AccountHistory({
            coins: coins,
            old_coins: 0,
            new_coins: coins,
            description: description,
            user: user_id,
            account: account_id
        });
        async.waterfall([
            function(cb) {
                account_history.save(function (err) {
                    if (err) {
                        console.log('history 1');
                        cb(err, null);
                    } else {
                        console.log('history 2');
                        cb(null, account_history);
                    }
                });
            }
        ], function(err, data) {
            console.log('history 3');
            return account_history;
        });
        console.log('history 4');
    }
};
