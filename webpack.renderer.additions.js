const path = require("path")
const {
  TsConfigPathsPlugin
} = require('awesome-typescript-loader');
const webpack = require("webpack");
const dotenv = require("dotenv");
const packageJson = require("./package.json");
const data = dotenv.config({ path: path.resolve(__dirname, `.env.${process.env.NODE_ENV}`) })
const flags = data.parsed ? Object.keys(data.parsed) : ["ELECTRON_WEBPACK_APP_CLIENT_ID", "ELECTRON_WEBPACK_APP_SENTRY_REPORT_URL", "ELECTRON_WEBPACK_APP_FB_APP_ID", "ELECTRON_WEBPACK_APP_GOOGLE_GA"]

const plugins = [];

if (process.env.SENTRY_AUTH_TOKEN) {
  plugins.push(new SentryPlugin({
    release: packageJson.version,
    include: '.',
    ignoreFile: '.sentrycliignore',
    ignore: ['node_modules', 'webpack.renderer.additions.js'],
  }))
}

module.exports = {
  resolve: {
    plugins: [
      new TsConfigPathsPlugin()
    ],
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    modules: [path.resolve(__dirname, 'src'), 'node_modules']
  },
  module: {
    rules: [{
      test: /\.tsx?$/,
      use: [{
        loader: 'tslint-loader',
        options: {
          emitErrors: true,
          failOnHint: true
        }
      }],
      enforce: 'pre',
      exclude: /node_modules/
    },
    {
      test: /\.jsx?$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader'
      }
    }]
  },
  devServer: {
    open:false
  },
  plugins: [
    new webpack.EnvironmentPlugin(['NODE_ENV', ...flags]),
    ...plugins
  ]
}