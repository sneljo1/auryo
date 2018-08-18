/**
 * Base webpack config used across other specific configs
 */
import dotenv from 'dotenv';
import path from 'path';
import webpack from 'webpack';
import { dependencies, optionalDependencies } from './src/package.json';

const data = dotenv.config({ path: path.resolve(__dirname, 'src', `.env.${process.env.NODE_ENV}`) })
const flags = data.parsed ? Object.keys(data.parsed) : []

const externals = {
    ...dependencies,
    ...optionalDependencies
}

export default {
    module: {
        rules: [{
            test: /\.jsx?$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                    cacheDirectory: true
                }
            }
        }]
    },

    output: {
        path: path.join(__dirname, 'src'),
        filename: 'bundle.js',
        // https://github.com/webpack/webpack/issues/1114
        libraryTarget: 'commonjs2'
    },

    // https://webpack.github.io/docs/configuration.html#resolve
    
    resolve: {
        extensions: ['.js', '.jsx', '.json'],
        modules: [
            path.join(__dirname, 'src'),
            'node_modules'
        ]
    },

    plugins: [
        new webpack.NamedModulesPlugin(),
        new webpack.EnvironmentPlugin(['NODE_ENV', ...flags])
    ],

    externals: Object.keys(externals || {})
}
