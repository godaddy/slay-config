/* eslint no-process-env: 0 */

'use strict';

var path = require('path'),
    assume = require('assume'),
    slay = require('slay');

var root = path.join(__dirname, 'sample-app');
var custom = {
  file: { file: path.join(root, 'config', 'test.json') },
  overrides: {
    crashOverride: '20-yrs',
    http: 6770
  }
};

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

describe('slay-config (simple)', function () {
  it('with defaults', function (done) {
    var app = testApp();
    app.start(function (err) {
      assume(err).is.not.an('error');
      assume(app.config).is.an('object');
      assume(app.config.get('assertValue')).equals('development');
      assume(app.config.get('env')).equals(app.env);
      app.close(done);
    });
  });

  it('with custom app.env "test"', function (done) {
    var app = testApp('test');
    app.start(function (err) {
      assume(err).is.not.an('error');
      assume(app.config).is.an('object');
      assume(app.config.get('assertValue')).equals('test');
      app.close(done);
    });
  });

  it('with custom NODE_ENV "test"', function (done) {
    var app = new slay.App(root);
    var previous = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';

    app.start(function (err) {
      assume(err).is.not.an('error');
      assume(app.config).is.an('object');
      assume(app.config.get('assertValue')).equals('test');
      process.env.NODE_ENV = previous;
      app.close(done);
    });
  });

  it('with custom file path in ENV', function (done) {
    var app = new slay.App(root);
    process.env.CONFIG = path.join(root, 'other-config.json');
    app.start(function (err) {
      assume(err).is.not.an('error');
      assume(app.config).is.an('object');
      assume(app.config.get('other')).equals('config');
      delete process.env.CONFIG;
      app.close(done);
    });
  });

  it('with custom file path in CLI arg', function (done) {
    var app = new slay.App(root);
    var arg = `--config=${path.join(root, 'other-config.json')}`;
    process.argv.push(arg);
    app.start(function (err) {
      assume(err).is.not.an('error');
      assume(app.config).is.an('object');
      assume(app.config.get('other')).equals('config');
      process.argv.pop();
      app.close(done);
    });
  });

  it('with custom { defaults } passed in slay-config(defaults)', function (done) {
    var app = testApp(custom);

    app.start(function (err) {
      assume(err).is.not.an('error');
      assume(app.config).is.an('object');
      assume(app.config.get('assertValue')).equals('test');
      assume(app.config.get('http')).equals(6770);
      app.close(done);
    });
  });

  it('with file represented as a relative string path', function (done) {
    var app = testApp({ file: './config/development.json' });
    app.start(function (err) {
      assume(err).is.not.an('error');
      assume(app.config).is.an('object');
      assume(app.config.get('assertValue')).equals('development');
      app.close(done);
    });
  });

  it('with custom { config } passed in app.start', function (done) {
    var app = testApp();
    app.start({ config: custom }, function (err) {
      assume(err).is.not.an('error');
      assume(app.config).is.an('object');
      assume(app.config.get('assertValue')).equals('test');
      assume(app.config.get('http')).equals(6770);
      app.close(done);
    });
  });
});
