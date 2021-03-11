const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const path = require('path');
const Dotenv = require('dotenv-webpack');

const NODE_ENV = process.env.NODE_ENV || 'development';
const isCI =
  process.env.CI || // Travis CI, CircleCI, Cirrus CI, Gitlab CI, Appveyor, CodeShip, dsari
  process.env.CONTINUOUS_INTEGRATION || // Travis CI, Cirrus CI
  process.env.BUILD_NUMBER || // Jenkins, TeamCity
  process.env.RUN_ID;

const CopyWebpackPlugin = require('copy-webpack-plugin');

const assets = ['static'];

module.exports = [
  new ForkTsCheckerWebpackPlugin(),
  new Dotenv({
    path: path.join(__dirname, `.env.${NODE_ENV}`),
    systemvars: isCI
  }),
  ...assets.map((asset) => {
    return new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, asset),
        to: path.resolve(__dirname, '.webpack/renderer', asset)
      }
    ]);
  })
];
