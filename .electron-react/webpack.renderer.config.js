'use strict';

process.env.BABEL_ENV = 'renderer';

const path = require('path');
const webpack = require('webpack');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const base = require('./webpack.base.config');
const merge = require('webpack-merge');
const SentryCliPlugin = require('@sentry/webpack-plugin');
const { dependencies, optionalDependencies, version: appVersion } = require('../package.json');

const externals = [...Object.keys(dependencies || {}), ...Object.keys(optionalDependencies || {})];

const isProd = process.env.NODE_ENV === 'production';
const isNotProd = process.env.NODE_ENV !== 'production';

let rendererConfig = {
  devtool: '#cheap-module-eval-source-map',
  entry: {
    renderer: path.join(__dirname, '../src/renderer/index.tsx')
  },
  externals,
  module: {
    rules: [
      {
        test: /\.(s)?css$/,
        exclude: /\.module\.(s)?css$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true
            }
          },
          'sass-loader'
        ]
      },
      {
        test: /\.module\.(s)?css$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              sourceMap: true,
              importLoaders: 1
            }
          },
          {
            loader: '@teamsupercell/typings-for-css-modules-loader'
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true
            }
          },
          {
            loader: 'sass-loader'
          }
        ]
      },
      {
        test: /\.(js|jsx|ts|tsx)$/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true
          }
        },
        exclude: /node_modules/
      },
      {
        test: /\.node$/,
        use: 'node-loader'
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        use: [
          {
            loader: 'url-loader',
            query: {
              limit: 10000,
              name: 'imgs/[name]--[folder].[ext]'
            }
          },
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                progressive: true,
                quality: 65
              },
              // optipng.enabled: false will disable optipng
              optipng: {
                optimizationLevel: 4
              },
              pngquant: {
                quality: [0.65, 0.9],
                speed: 4
              },
              gifsicle: {
                interlaced: false
              },
              // the webp option will enable WEBP
              webp: {
                quality: 75
              }
            }
          }
        ]
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'media/[name]--[folder].[ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        use: {
          loader: 'url-loader',
          query: {
            limit: 10000,
            name: 'fonts/[name]--[folder].[ext]'
          }
        }
      }
    ]
  },
  node: {
    __dirname: isNotProd,
    __filename: isNotProd
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      tsconfig: path.join(__dirname, '..', 'tsconfig.json')
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, '../src/index.ejs'),
      templateParameters(compilation, assets, options) {
        return {
          compilation: compilation,
          webpack: compilation.getStats().toJson(),
          webpackConfig: compilation.options,
          htmlWebpackPlugin: {
            files: assets,
            options: options
          },
          process
        };
      },
      minify: {
        removeRedundantAttributes: true, // 删除多余的属性
        collapseWhitespace: true, // 折叠空白区域
        removeAttributeQuotes: true, // 移除属性的引号
        removeComments: true, // 移除注释
        collapseBooleanAttributes: true // 省略只有 boolean 值的属性值 例如：readonly checked
      },
      nodeModules: isNotProd ? path.resolve(__dirname, '../node_modules') : false
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ],
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '../dist/electron')
  },
  resolve: {
    modules: ['src', 'node_modules'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: path.join(__dirname, '..', 'tsconfig.json')
      })
    ],
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.node']
  },
  target: 'electron-renderer'
};

/**
 * Adjust rendererConfig for development settings
 */
if (isNotProd) {
  rendererConfig.plugins.push(
    new webpack.DefinePlugin({
      __static: `"${path.join(__dirname, '../static').replace(/\\/g, '\\\\')}"`
    })
  );
}

/**
 * Adjust rendererConfig for production settings
 */
if (isProd) {
  rendererConfig.devtool = 'source-map';
  rendererConfig.optimization = {
    minimize: true,
    minimizer: [new TerserPlugin({ extractComments: false }), new OptimizeCSSAssetsPlugin({})]
  };

  rendererConfig.plugins.push(
    new MiniCssExtractPlugin({ filename: 'styles.css' }),
    new CopyWebpackPlugin([
      {
        from: path.join(__dirname, '../static'),
        to: path.join(__dirname, '../dist/electron/static'),
        ignore: ['.*']
      }
    ]),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  );

  if (process.env.SENTRY_AUTH_TOKEN) {
    rendererConfig.plugins.push(
      new SentryCliPlugin({
        release: appVersion,
        include: [path.join(__dirname, '../dist/electron')],
        urlPrefix: 'app:///dist/electron/'
      })
    );
  }
}

module.exports = merge.smart(base, rendererConfig);
