const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const path = require('path');
const Dotenv = require('dotenv-webpack');

const NODE_ENV = process.env.NODE_ENV || 'development';
const isCI =
  process.env.CI || // Travis CI, CircleCI, Cirrus CI, Gitlab CI, Appveyor, CodeShip, dsari
  process.env.CONTINUOUS_INTEGRATION || // Travis CI, Cirrus CI
  process.env.BUILD_NUMBER || // Jenkins, TeamCity
  process.env.RUN_ID;

const { optionalDependencies } = require('./package.json');

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/main/index.ts',
  externals: Object.keys(optionalDependencies),
  // Put your normal webpack config below here
  module: {
    rules: [
      ...require('./webpack.rules'),
      {
        test: /(pino-tee\/tee|mqtt\/mqtt|mqtt\/bin\/.*)\.js$/,
        loader: 'shebang-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: path.join(__dirname, 'tsconfig.json')
      })
    ]
  },

  plugins: [
    new Dotenv({
      path: path.join(__dirname, `.env.${NODE_ENV}`),
      systemvars: isCI
    })
  ]
};
