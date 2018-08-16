/**
 * Build config for electron 'Renderer Process' file
 */
import path from 'path';
import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import merge from 'webpack-merge';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MinifyPlugin from 'babili-webpack-plugin';
import baseConfig from './webpack.config.base';
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
import LodashModuleReplacementPlugin from 'lodash-webpack-plugin';

export default merge(baseConfig, {

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
                loader: ExtractTextPlugin
                    .extract({
                        fallback: 'style-loader',
                        use: [
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
                    })
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

    plugins: [

        new LodashModuleReplacementPlugin(),
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

        /**
         * Babli is an ES6+ aware minifier based on the Babel toolchain (beta)
         */
        new MinifyPlugin(),

        new UglifyJSPlugin({
            parallel: true,
            sourceMap: true
        }),

        new ExtractTextPlugin('style.css'),

        /**
         * Dynamically generate index.html page
         */
        new HtmlWebpackPlugin({
            filename: '../app.html',
            template: 'src/renderer/app.html',
            inject: false
        })
    ],

    // https://github.com/chentsulin/webpack-target-electron-renderer#how-this-module-works
    target: 'electron-renderer'
});