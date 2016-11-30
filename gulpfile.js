/* eslint no-process-env: 0 */
'use strict';

var gulp = require('gulp');
var path = require('path');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

require('godaddy-test-tools')(gulp, {
  es6: true,
  sourceFiles: 'index.js',
  unitTestFiles: 'test/*.test.js',
  lint: {
    files: ['index.js', 'test/*.js'],
    eslint: {
      baseConfig: path.resolve(__dirname, '.eslintrc')
    }
  }
});


gulp.task('test', 'Run all the tests with code coverage',
  ['lint', 'unit-coverage']);
