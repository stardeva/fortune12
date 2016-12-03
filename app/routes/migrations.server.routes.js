'use strict';

module.exports = function(app) {
  var migrations = require('../../app/controllers/migrations.server.controller');
  app.route('/migrations').get(migrations.index);
};
