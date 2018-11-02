const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const baseConfig = require('./webpack.base')
const UglyfyJsPlugin = require('uglifyjs-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')

module.exports = merge(baseConfig, {
  mode: 'production',
  entry: {
    renderer: './src/renderer/index.tsx'
  },
  devtool: false,
  optimization: {
    minimizer: [
      new UglyfyJsPlugin({
        cache: true,
        parallel: true,
        uglifyOptions: {
          compress: true,
          ecma: 6,
          mangle: true
        },
        sourceMap: true
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
    new OptimizeCssAssetsPlugin({}),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new HtmlWebpackPlugin({
      filename: './index.html',
      template: 'src/index.html',
      inject: true,
      hash: true,
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
