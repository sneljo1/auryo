const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const baseConfig = require('./webpack.base')
const UglyfyJsPlugin = require('uglifyjs-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const SentryPlugin = require('@sentry/webpack-plugin')
const packageJson = require('../package.json');
const plugins = [];
const TerserPlugin = require('terser-webpack-plugin');

if (process.env.SENTRY_AUTH_TOKEN) {
  plugins.push(new SentryPlugin({
    release: packageJson.version,
    include: ['./dist'],
  }))
}

module.exports = merge(baseConfig, {
  mode: 'production',
  entry: {
    renderer: './src/renderer/index.tsx'
  },
  devtool: "source-map",
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          parse: {
            // we want terser to parse ecma 8 code. However, we don't want it
            // to apply any minfication steps that turns valid ecma 5 code
            // into invalid ecma 5 code. This is why the 'compress' and 'output'
            // sections only apply transformations that are ecma 5 safe
            // https://github.com/facebook/create-react-app/pull/4234
            ecma: 8,
          },
          compress: {
            ecma: 5,
            warnings: false,
            // Disabled because of an issue with Uglify breaking seemingly valid code:
            // https://github.com/facebook/create-react-app/issues/2376
            // Pending further investigation:
            // https://github.com/mishoo/UglifyJS2/issues/2011
            comparisons: false,
            // Disabled because of an issue with Terser breaking valid code:
            // https://github.com/facebook/create-react-app/issues/5250
            // Pending futher investigation:
            // https://github.com/terser-js/terser/issues/120
            inline: 2,
          },
          mangle: {
            safari10: true,
          },
          output: {
            ecma: 5,
            comments: false,
            // Turned on because emoji and regex is not minified properly using default
            // https://github.com/facebook/create-react-app/issues/2488
            ascii_only: true,
          },
        },
        // Use multi-process parallel running to improve the build speed
        // Default number of concurrent runs: os.cpus().length - 1
        parallel: true,
        // Enable file caching
        cache: true,
        sourceMap: true,
      })
    ],
    runtimeChunk: {
      name: 'manifest'
    },
    splitChunks: {
      cacheGroups: {
        commons: {
          chunks: 'initial',
          minChunks: 2,
          maxInitialRequests: 5,
          minSize: 0
        },

        vendor: {
          test: /node_modules/,
          chunks: 'initial',
          name: 'vendor',
          priority: 10,
          enforce: true
        }
      }
    }
  },
  plugins: [
    ...plugins,
    new OptimizeCssAssetsPlugin({}),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new HtmlWebpackPlugin({
      filename: './index.html',
      template: 'src/index.html',
      inject: true,
      hash: false,
      minify: {
        removeComment: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
      },
      nodeModules: path.resolve(__dirname, '../node_modules')
    })
  ],
  target: 'electron-renderer'
})
