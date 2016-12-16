'use strict';

var _ = require('lodash'),
    moment = require('moment'),
    ALY = require('aliyun-sdk'),
    config = require('../../config/config');

module.exports = {
    push: function() {
        return new ALY.PUSH({
            accessKeyId: config.aliyun.accessKeyId,
            secretAccessKey: config.aliyun.secretAccessKey,
            endpoint: config.aliyun.endpoint,
            apiVersion: config.aliyun.apiVersion
        });
    },

    push_android: function(title, summary, content) {
        content = _.extend({}, content);
        this.push().pushNoticeToAndroid({
            AppKey: config.aliyun.appKey,
            Target: 'all',
            TargetValue: 'all',
            Title: title,
            Summary: summary,
            AndroidExtParameters: JSON.stringify(content)
        }, function (err, res) {
            console.log(err, res);
        });
    },

    push_ios: function(title, summary, content) {
        this.push().pushNoticeToiOS({
            AppKey: config.aliyun.appKey,
            Env: 'DEV',
            Target: 'all',
            TargetValue: 'all',
            Summary: summary,
            Ext: JSON.stringify({'sound': 'default', 'badge': '1'}),
            iOSExtParameters: JSON.stringify(content)
        }, function (err, res) {
            console.log(err, res);
        });
    },

    push_notifications: function(title, summary, content) {
        // this.push_android(title, summary, content);
        this.push_ios(title, summary, content);
    }
};
