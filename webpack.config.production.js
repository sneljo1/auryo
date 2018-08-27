/**
 * Build config for electron 'Renderer Process' file
 */
import SentryPlugin from "@sentry/webpack-plugin";
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import path from 'path';
import webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import merge from 'webpack-merge';
import baseConfig from './webpack.config.base';
import version from "./src/package.json";

const UglifyJSPlugin = require('uglifyjs-webpack-plugin')


export default merge(baseConfig, {
    mode: 'production',

    target: 'electron-renderer',

    entry: [path.join(__dirname, 'src', 'renderer', 'index.jsx')],

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
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: './'
                        }
                    },
                    { loader: 'css-loader', query: { modules: false, sourceMaps: true } },
                    { loader: 'sass-loader', query: { sourceMaps: true } },
                    {
                        loader: 'sass-resources-loader',
                        options: {
                            resources: [
                                path.join(__dirname, 'src', "renderer", "css", "bootstrap.imports.scss")
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
            // Common Image Formats
            {
                test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
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

        new MiniCssExtractPlugin({
            filename: 'style.css'
        }),

        new BundleAnalyzerPlugin({
            analyzerMode:
                process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
            openAnalyzer: process.env.OPEN_ANALYZER === 'true'
        }),

        new SentryPlugin({
            release: version,
            include: ['./src/dist', 'src/main.*'],
            ignore: ['node_modules', 'webpack.config.js'],
            dryRun: true
        })
    ],

});