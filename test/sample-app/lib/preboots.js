'use strict';

/*
 * Stub middleware loader to be structured
 */
module.exports = function (app, options, done) {
  app.preboot(require('../../../')(app.__testDefaults));
  done();
};
