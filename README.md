# slay-config
Standard, sane defaults for config in slay apps.

## Usage

Simply add `slay-config` as a preboot in your standard preboot location. Generally speaking it should be towards the top of your application's preboots since it will be loading in configuration that others will need.

**lib/preboot.js**
``` js
module.exports = function (app, options, done) {
  // ...

  app.preboot(require('slay-config')({
    //
    // Any defaults for configuring the `nconf` instance
    // attached to the `app`.
    //
  }));

  // ...
};
```

This will setup your application config to load from (in-order):

1. Any forced programmatic overrides
2. CLI arguments
3. Environment variables
4. Config file (defaulting to `config/{env}.json`)
5. _[Optional]_ [Secure file][secure-file]


## Options

``` js
app.preboot(require('slay-config')(defaults));
```

Where `defaults` can have the following properties (all of which are optional):

* **overrides:** _{Object}_ Any [overrides] for your application's config.
* **argv:** _{Object}_ Settings for loading [CLI arguments] into application config.
* **env:** _{Object}_ Settings for loading [environment variables] into application config.
* **file:** _{Object}_ Settings for loading [a file] to configure your application. Defaults to `${app.root}/config/${env}.json`.
* **secure:** _{String}_ If set, will look for [secure nconf settings][secure-file] in the config property at that location.

### Default CLI args and ENV vars

If you do not have the luxury of being able to pass in explicit options to
configure a `slay-config`, we have added the ability to configure
`slay-config` with ENV vars or CLI args.

**CLI Args**:
  - `config`: The file path for the configuration file to load.
  - `secure-file`: The file path for the secure configuration file to load.
  - `secure-secret`: The file path for the secret used to encrypt the secure
    configuration file.

**ENV vars**:
  - `CONFIG`
  - `SECURE_FILE`
  - `SECURE_SECRET`

### Loading encrypted secure config

This can be done in one of two ways:

##### 1. Specifying the `secure` option in your cleartext config file

When specifying this option be aware that _all relative file paths will resolved from `app.root`._

**config/development.json**
``` js
{
  // ... other configuration values
  "secure": {
    "file": "./config/secure/development.json",
    "secretPath": "./config/secure/development.key"
  }
}
```

##### 2. Specifying the `secure` option when requiring `slay-config`

``` js
  app.preboot(require('slay-config')({
    secure: {
      file: './config/secure/development.json'
      secretPath: './config/secure/development.key'
    }
  }));

```

### Changing configuration loading

Often (and mainly for testing purposes) it is often useful to change the options passed into to your configuration loader so as to turn on or off certain values (e.g. turning off logging in your tests).

With this in mind any `defaults` passed to `slay-config` can be overridden by the `config` property passed to `app.start` e.g.:

**lib/preboot.js**
``` js
module.exports = function (app, options, done) {
  // ...

  app.preboot(require('slay-config')({
    file: { file: path.join(app.root, 'config', app.env + '.json') }
  }));

  // ...
};
```

Can be overridden to a test configuration file when calling `app.start`:

``` js
app.start({
  config: {
    file: { file: path.join(app.root, 'test', 'config', app.env + '.json') }
  }
}, callback);
```

## Tests

```
npm test
```

## License
MIT

##### Contributors: [Fady Matar](https://github.secureserver.net/fmatar), [Charlie Robbins](https://github.secureserver.net/crobbins)

[overrides]: https://github.com/indexzero/nconf#literal
[CLI arguments]: https://github.com/indexzero/nconf#argv
[environment variables]: https://github.com/indexzero/nconf#env
[a file]: https://github.com/indexzero/nconf#file
[secure-file]: https://github.com/indexzero/nconf#encrypting-file-contents
