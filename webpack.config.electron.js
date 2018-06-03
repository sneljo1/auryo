/**
 * Build config for electron 'Main Process' file
 */
import webpack from "webpack";
import merge from "webpack-merge";
import MinifyPlugin from "babili-webpack-plugin";
import baseConfig from "./webpack.config.base";
import path from "path";

export default merge(baseConfig, {
    devtool: 'source-map',

    entry: ['babel-polyfill', './src/main/index'],

    // 'main.js' in root
    output: {
        path: __dirname,
        filename: './src/main.js'
    },

    plugins: [
        /**
         * Babli is an ES6+ aware minifier based on the Babel toolchain (beta)
         */
        new MinifyPlugin(),

        /**
         * Create global constants which can be configured at compile time.
         *
         * Useful for allowing different behaviour between development builds and
         * release builds
         *
         * NODE_ENV should be production so that modules do not perform certain
         * development checks
         */
    ],

    /**
     * Set target to Electron specific node.js env.
     * https://github.com/chentsulin/webpack-target-electron-renderer#how-this-module-works
     */
    target: 'electron-main',

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