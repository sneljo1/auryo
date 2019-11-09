/**
 * Webpack config for production electron main process
 */

import path from "path";
import merge from "webpack-merge";
import TerserPlugin from "terser-webpack-plugin";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import baseConfig from "./webpack.config.base";
import CheckNodeEnv from "../internals/scripts/CheckNodeEnv";

CheckNodeEnv("production");

export default merge.smart(baseConfig, {
	devtool: "source-map",

	mode: "production",

	target: "electron-main",

	entry: "./src/main/index.ts",

	output: {
		path: path.join(__dirname, "..", "dist"),
		filename: "./main.prod.js"
	},

	optimization: {
		minimizer: process.env.E2E_BUILD
			? []
			: [
					new TerserPlugin({
						terserOptions: {
							parse: {
								// we want terser to parse ecma 8 code. However, we don't want it
								// to apply any minfication steps that turns valid ecma 5 code
								// into invalid ecma 5 code. This is why the 'compress' and 'output'
								// sections only apply transformations that are ecma 5 safe
								// https://github.com/facebook/create-react-app/pull/4234
								ecma: 8
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
								inline: 2
							},
							mangle: {
								safari10: true
							},
							output: {
								ecma: 5,
								comments: false,
								// Turned on because emoji and regex is not minified properly using default
								// https://github.com/facebook/create-react-app/issues/2488
								ascii_only: true
							}
						},
						// Use multi-process parallel running to improve the build speed
						// Default number of concurrent runs: os.cpus().length - 1
						parallel: true,
						// Enable file caching
						cache: true,
						sourceMap: true
					})
			  ]
	},

	plugins: [
		new BundleAnalyzerPlugin({
			analyzerMode: process.env.OPEN_ANALYZER === "true" ? "server" : "disabled",
			openAnalyzer: process.env.OPEN_ANALYZER === "true"
		})
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

	resolve: {
		alias: {
			jsbi: path.resolve(__dirname, "..", "node_modules", "jsbi", "dist", "jsbi-cjs.js")
		}
	}
});
