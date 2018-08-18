/**
 * Build config for electron 'Renderer Process' file
 */
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import path from 'path';
import webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import merge from 'webpack-merge';
import baseConfig from './webpack.config.base';

const UglifyJSPlugin = require('uglifyjs-webpack-plugin')


export default merge(baseConfig, {
    mode: 'production',

    target: 'electron-renderer',

    entry: ['babel-polyfill', path.join(__dirname, 'src', 'renderer', 'index.jsx')],

    output: {
        path: path.join(__dirname, 'src/dist'),
        publicPath: '../dist/'
    },

    module: {
        rules: [
            // Pipe other styles through css modules and append to style.css
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    { loader: 'css-loader', query: { modules: false, sourceMaps: true } },
                    { loader: 'sass-loader', query: { sourceMaps: true } },
                    {
                      loader: 'sass-resources-loader',
                      options: {
                        resources: [
                          path.join(__dirname, 'src', "renderer","css", "bootstrap.imports.scss")
                        ]
                      },
                    }
                ]
            },
            {
                test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 10000,
                        mimetype: 'application/font-woff'
                    }
                }
            },
            {
                test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 10000,
                        mimetype: 'application/font-woff'
                    }
                }
            },
            {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 10000,
                        mimetype: 'application/octet-stream'
                    }
                }
            },
            {
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                use: 'file-loader'
            },
            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 10000,
                        mimetype: 'image/svg+xml'
                    }
                }
            },
            {
                test: /.*\.(gif|png|jpe?g)$/,
                use: [
                    {
                        loader: 'file-loader'
                    }
                ]
            },
            {
                test: /\.(?:ico|webp)$/,
                use: 'url-loader'
            }
        ]
    },

    optimization: {
        minimizer: [
          new UglifyJSPlugin({
            parallel: true,
            sourceMap: true
          }),
          new OptimizeCSSAssetsPlugin({
            cssProcessorOptions: {
              map: {
                inline: false,
                annotation: true
              }
            }
          })
        ]
      },

    plugins: [

        // new LodashModuleReplacementPlugin(),
        /**
         * Create global constants which can be configured at compile time.
         *
         * Useful for allowing different behaviour between development builds and
         * release builds
         *
         * NODE_ENV should be production so that modules do not perform certain
         * development checks
         */
        new webpack.EnvironmentPlugin({
            NODE_ENV: 'production',
            DEBUG_PROD: 'false'
        }),

        new ExtractTextPlugin('style.css'),

        /**
         * Dynamically generate index.html page
         */
        new HtmlWebpackPlugin({
            filename: '../app.html',
            template: 'src/renderer/app.html',
            inject: false
        }),

        new BundleAnalyzerPlugin({
          analyzerMode:
            process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
          openAnalyzer: process.env.OPEN_ANALYZER === 'true'
        })
    ],
    
});