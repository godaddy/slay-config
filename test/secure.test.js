'use strict';

var path = require('path'),
    assume = require('assume'),
    slay = require('slay');

var root = path.join(__dirname, 'sample-app');

/*
 * Helper function that creates a test application
 * with the specified `defaults` passed to `slay-config`
 */
function testApp(env, defaults) {
  if (typeof env !== 'string') {
    defaults = env;
    env = 'development';
  }

  var app = new slay.App(root);
  app.env = env;
  app.__testDefaults = defaults;
  return app;
}

describe('slay-config (secure)', function () {
  it('with { secure, secret } property in config file', function (done) {
    var app = testApp({ file: path.join(root, 'config', 'secure.json') });

    app.start(function (err) {
      assume(err).is.not.an('error');
      assume(app.config).is.an('object');
      assume(app.config.stores.secure).is.an('object');
      assume(app.config.get('literal')).equals('bazz');
      assume(app.config.get('arr')).deep.equals(app.config.stores.secure.store.arr);
      app.close(done);
    });
  });

  it('with { secure, secretPath }', function (done) {
    var app = testApp({
      secure: {
        file: './config/secure/development.json',
        secretPath: './config/secure/development.key'
      }
    });

    app.start(function (err) {
      assume(err).is.not.an('error');
      assume(app.config).is.an('object');
      assume(app.config.stores.secure).is.an('object');
      assume(app.config.get('literal')).equals('bazz');
      assume(app.config.get('arr')).deep.equals(app.config.stores.secure.store.arr);
      app.close(done);
    });
  });

  it('with SECURE_FILE and SECURE_SECRET env vars', function (done) {
    var app = testApp('test');
    process.env.SECURE_FILE = path.join(root, 'config', 'secure', 'development.json');
    process.env.SECURE_SECRET = path.join(root, 'config', 'secure', 'development.key');

    app.start(function (err) {
      assume(err).is.not.an('error');
      assume(app.config).is.an('object');
      assume(app.config.stores.secure).is.an('object');
      assume(app.config.get('literal')).equals('bazz');
      assume(app.config.get('arr')).deep.equals(app.config.stores.secure.store.arr);
      app.close(done);
    });
  });

  it('with secure-file and secure-secret cli args', function (done) {
    var app = testApp('test');
    process.argv.push(`--secure-file=${path.join(root, 'config', 'secure', 'development.json')}`);
    process.argv.push(`--secure-secret=${path.join(root, 'config', 'secure', 'development.key')}`);

    app.start(function (err) {
      assume(err).is.not.an('error');
      assume(app.config).is.an('object');
      assume(app.config.stores.secure).is.an('object');
      assume(app.config.get('literal')).equals('bazz');
      assume(app.config.get('arr')).deep.equals(app.config.stores.secure.store.arr);
      app.close(done);
    });
  });
});
