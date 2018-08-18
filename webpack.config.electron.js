/**
 * Build config for electron 'Main Process' file
 */
import UglifyJSPlugin from 'uglifyjs-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import merge from "webpack-merge";
import baseConfig from "./webpack.config.base";

export default merge(baseConfig, {
    devtool: 'source-map',

    mode: 'production',

    target: 'electron-main',

    entry: ['./src/main/index'],

    // 'main.js' in root
    output: {
        path: __dirname,
        filename: './src/main.js'
    },

    optimization: {
        minimizer: [
            new UglifyJSPlugin({
                parallel: true,
                sourceMap: true
            })
        ]
    },

    plugins: [
        new BundleAnalyzerPlugin({
            analyzerMode:
                process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
            openAnalyzer: process.env.OPEN_ANALYZER === 'true'
        }),
    ],

    /**
     * Disables webpack processing of __dirname and __filename.
     * If you run the bundle in node.js it falls back to these values of node.js.
     * https://github.com/webpack/webpack/issues/2010
     */
    node: {
        __dirname: false,
        __filename: false
    },
});