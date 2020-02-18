'use strict';

const webpack = require('webpack');
const NODE_ENV = process.env.NODE_ENV || 'development';
const Dotenv = require('dotenv-webpack');

const path = require('path');

const isCI =
  process.env.CI || // Travis CI, CircleCI, Cirrus CI, Gitlab CI, Appveyor, CodeShip, dsari
  process.env.CONTINUOUS_INTEGRATION || // Travis CI, Cirrus CI
  process.env.BUILD_NUMBER || // Jenkins, TeamCity
  process.env.RUN_ID;

let baseConfig = {
  plugins: [
    new Dotenv({
      path: path.join(__dirname, '..', `.env.${NODE_ENV}`),
      systemvars: isCI
    })
  ]
};

module.exports = baseConfig;
