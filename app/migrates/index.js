'use strict';

var init = require('../../config/init')(),
	config = require('../../config/config'),
	mongoose = require('mongoose'),
	chalk = require('chalk'),
    async = require('async'),
    users = require('./users.json'),
    settings = require('./settings.json'),
    _ = require('lodash'),
    path = require('path'),
    chalk = require('chalk');

var db = mongoose.connect(config.db.uri, config.db.options, function(err) {
	if (err) {
		console.error(chalk.red('Could not connect to MongoDB!'));
		console.log(chalk.red(err));
	}
});

mongoose.connection.on('error', function(err) {
	console.error(chalk.red('MongoDB connection error: ' + err));
	process.exit(-1);
	}
);

// Globbing model files
config.getGlobbedFiles('./app/models/**/*.js').forEach(function(modelPath) {
    require(path.resolve(modelPath));
});

var User = mongoose.model('User'),
    Account = mongoose.model('Account'),
    Setting = mongoose.model('Setting'),
    AccountHistory = mongoose.model('AccountHistory');

var create_settings = function(next) {
    var setting = new Setting(settings[0]);
    setting.save(function(err) {
        if(err) next(err, null);
        else next(null, setting);
    });
};

var create_users = function(next) {
    var create_users_callbacks = [];
    _.each(users, function(user) {
        create_users_callbacks.push(function(done) {
            var u = new User(user);
            u.save(function(err) {
                if(err) done(err, null);
                else done(null, u);
            });
        });
    });
    async.parallel(create_users_callbacks, function(err, users) {
        next(err, users);
    });
};

var create_accounts = function(setting, users, next) {
    var create_accounts_callbacks = [];
    var new_user_coins = setting.new_user_coins;
    _.each(users, function(user) {
        if(_.includes(user.roles, 'user')) {
            create_accounts_callbacks.push(function(done) {
                var account = new Account({coins: new_user_coins, user: user});
                account.save(function(err) {
                    if(err) done(err, null);
                    else {
                        var account_history = new AccountHistory({
                            coins: new_user_coins,
                            old_coins: 0,
                            new_coins: new_user_coins,
                            type: 'new',
                            description: 'New user',
                            user: user,
                            account: account
                        });
                        account_history.save(function(err1) {
                            if(err1) done(err1, null);
                            else {
                                user.account = account;
                                user.save(function(err2) {
                                    if(err2) done(err2, null);
                                    else done(null, account);
                                });
                            }
                        });
                    }
                });
            });
        }
    });
    async.parallel(create_accounts_callbacks, function(err, accounts) {
        next(err, accounts);
    });
};

var init_migrates = function() {
    create_settings(function(err, setting) {
        create_users(function(err1, users) {
            create_accounts(setting, users, function(err2, accounts) {
                console.log(chalk.green('Success!'));
            });
        });
    });
};

init_migrates();
