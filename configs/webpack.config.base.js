/**
 * Base webpack config used across other specific configs
 */

import path from "path";
import webpack from "webpack";
import { dependencies, optionalDependencies } from "../package.json";

const NODE_ENV = process.env.NODE_ENV || "development";

const dotenv = require("dotenv").config({ path: path.join(__dirname, "..", `.env.${NODE_ENV}`) });

export default {
	externals: [...Object.keys(dependencies || {}), ...Object.keys(optionalDependencies || {})],

	module: {
		rules: [
			{
				test: /\.[jt]sx?$/,
				exclude: /node_modules/,
				use: [
					{
						loader: "babel-loader",
						options: {
							cacheDirectory: true
						}
					},
					"ts-loader"
				]
			}
		]
	},

	output: {
		path: path.join(__dirname, "..", "app"),
		// https://github.com/webpack/webpack/issues/1114
		libraryTarget: "commonjs2"
	},

	/**
	 * Determine the array of extensions that should be used to resolve modules.
	 */
	resolve: {
		extensions: [".js", ".ts", ".tsx", ".json"]
	},

	plugins: [
		new webpack.EnvironmentPlugin({
			...dotenv.parsed
		}),

		new webpack.DefinePlugin({
			"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
		}),

		new webpack.NamedModulesPlugin()
	]
};
