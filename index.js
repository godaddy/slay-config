/* eslint no-process-env: 0, max-statements: [2, 20] */

'use strict';

const path = require('path');
const merge = require('lodash.merge');
const isAbsolute = require('path-is-absolute');

const debug = require('diagnostics')('slay-config');

module.exports = function (defaults) {
  debug('defaults', defaults);
  return function (app, options, done) {
    //
    // Merge the defaults passed to the preboot, and any `options.config`
    // passed to `app.start`.
    //
    var opts = merge({}, defaults, options.config || {});
    var env = app.env || options.env || process.env.NODE_ENV;

    //
    // Setup your config to load from (in-order):
    // 1. Any forced programmatic overrides
    // 2. CLI arguments
    // 3. Environment variables
    // 4. Config file (defaulting to `config/{env}.json`)
    //
    app.config
      .overrides(opts.overrides || {})
      .use('argv', opts.argv)
      .use('env', opts.env);

    //
    // Setup our default file location
    // 1. First check for any CLI args/env var
    // 2. Then default it to a specific location in the repo
    //
    opts.file = opts.file || app.config.get('config') || app.config.get('CONFIG');

    opts.file = opts.file || { file: path.join(app.rootDir || app.root, 'config', env + '.json') };
    if (typeof opts.file === 'string') {
      opts.file = { file: opts.file };
    }

    if (!isAbsolute(opts.file.file)) {
      debug('resolve file', app.rootDir || app.root, opts.file.file);
      opts.file.file = path.resolve(app.rootDir || app.root, opts.file.file);
    }

    debug('env', env);
    debug('merged options', opts);

    //
    // Finish configuring with file and defaults
    //
    app.config
      .use('file', opts.file)
      .defaults({
        env: env
      });

    //
    // Now attempt to load the secure configuration (if any).
    //
    loadSecure(app, opts.secure || app.config.get('secure'), done);
  };
};

/*
 * Loads the secure configuration specified by the `secureOpts` (if any).
 * If there is no secure configuration then simply loads `app.config`.
 */
function loadSecure(app, secureOpts, done) {
  secureOpts = secureOpts || {
    file: app.config.get('secure-file') || app.config.get('SECURE_FILE'),
    secretPath: app.config.get('secure-secret') || app.config.get('SECURE_SECRET')
  };
  //
  // If we do not have the expected options we aren't loading a secure config
  //
  if (!(secureOpts.file && (secureOpts.secret || secureOpts.secretPath))) {
    return app.config.load(done);
  }

  debug('read secure', secureOpts);
  if (!secureOpts.file) {
    return done(new Error('{ file } is required with secure config.'));
  } else if (!secureOpts.secretPath && !secureOpts.secret) {
    return done(new Error('secret or secretPath are required with secure: ' + Object.keys(secureOpts)));
  }

  var resolved = {
    file: secureOpts.file,
    secure: {
      secret: secureOpts.secret,
      alg: secureOpts.alg
    }
  };

  if (!isAbsolute(secureOpts.file)) {
    debug('resolve secure file', app.rootDir || app.root, secureOpts.file);
    resolved.file = path.resolve(app.rootDir || app.root, secureOpts.file);
  }

  if (secureOpts.secretPath) {
    resolved.secure.secretPath = secureOpts.secretPath;
    if (!isAbsolute(secureOpts.secretPath)) {
      debug('resolve secretPath', app.rootDir || app.root, secureOpts.secretPath);
      resolved.secure.secretPath = path.resolve(app.rootDir || app.root, secureOpts.secretPath);
    }
  }

  debug('secure file', resolved.file);
  debug('secure opts', resolved.secure);
  app.config.file('secure', resolved);
  app.config.load(done);
}
