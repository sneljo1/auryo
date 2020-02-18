'use strict';

const webpack = require('webpack');
const NODE_ENV = process.env.NODE_ENV || 'development';

const path = require('path');

const dotenv = require('dotenv').config({ path: path.join(__dirname, '..', `.env.${NODE_ENV}`) });

let baseConfig = {
  plugins: [
    new webpack.EnvironmentPlugin({
      ...dotenv.parsed
    })
  ]
};

module.exports = baseConfig;
