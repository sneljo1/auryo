'use strict';

process.env.BABEL_ENV = 'main';

const path = require('path');
const merge = require('webpack-merge');
const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const base = require('./webpack.base.config');

const { dependencies, optionalDependencies } = require('../package.json');

const externals = [...Object.keys(dependencies || {}), ...Object.keys(optionalDependencies || {})];

let mainConfig = {
  entry: {
    main: path.join(__dirname, '../src/main/index.ts')
  },
  externals,
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
          experimentalWatchApi: true
        },
        exclude: /node_modules/
      },
      {
        test: /\.node$/,
        use: 'node-loader'
      },
      {
        test: /(pino-tee\/tee|mqtt\/mqtt|mqtt\/bin\/.*)\.js$/,
        loader: 'shebang-loader'
      }
    ]
  },
  node: {
    __dirname: process.env.NODE_ENV !== 'production',
    __filename: process.env.NODE_ENV !== 'production'
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '../dist/electron')
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      tsconfig: path.join(__dirname, '..', 'tsconfig.json')
    }),
    new webpack.NoEmitOnErrorsPlugin()
  ],
  resolve: {
    modules: ['src', 'node_modules'],
    extensions: ['.js', '.ts', '.json', '.node'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: path.join(__dirname, '..', 'tsconfig.json')
      })
    ],
    alias: {
      jsbi: path.resolve(__dirname, '..', 'node_modules', 'jsbi', 'dist', 'jsbi-cjs.js')
    }
  },
  target: 'electron-main'
};

/**
 * Adjust mainConfig for development settings
 */
if (process.env.NODE_ENV !== 'production') {
  mainConfig.plugins.push(
    new webpack.DefinePlugin({
      __static: `"${path.join(__dirname, '../static').replace(/\\/g, '\\\\')}"`
    })
  );
}

/**
 * Adjust mainConfig for production settings
 */
if (process.env.NODE_ENV === 'production') {
  mainConfig.devtool = 'source-map';
  mainConfig.optimization = {
    minimize: true,
    minimizer: [new TerserPlugin()]
  };
  mainConfig.plugins.push(
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    })
  );
}

module.exports = merge.smart(base, mainConfig);
