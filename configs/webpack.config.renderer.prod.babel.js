/**
 * Build config for electron renderer process
 */

import path from "path";
import webpack from "webpack";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import OptimizeCSSAssetsPlugin from "optimize-css-assets-webpack-plugin";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import merge from "webpack-merge";
import TerserPlugin from "terser-webpack-plugin";
import baseConfig from "./webpack.config.base";
import CheckNodeEnv from "../internals/scripts/CheckNodeEnv";
import HtmlWebpackPlugin from "html-webpack-plugin";

CheckNodeEnv("production");
export default merge.smart(baseConfig, {
	devtool: "source-map",

	mode: "production",

	target: "electron-renderer",

	entry: path.join(__dirname, "..", "src/renderer/index"),

	output: {
		path: path.join(__dirname, "..", "dist"),
		publicPath: "./",
		filename: "renderer.prod.js"
	},

	module: {
		rules: [
			{
				test: /\.(s)?css$/,
				exclude: /\.module\.(s)?css$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader
					},
					{
						loader: "css-loader",
						options: {
							sourceMap: true
						}
					},
					{
						loader: "postcss-loader",
						options: {
							sourceMap: true
						}
					},
					{
						loader: "sass-loader",
						options: {
							sourceMap: true
						}
					}
				]
			},
			{
				test: /\.module\.(s)?css$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader
					},
					{
						loader: "css-loader",
						options: {
							modules: true,
							sourceMap: true,
							importLoaders: 1
						}
					},
					{
						loader: "@teamsupercell/typings-for-css-modules-loader"
					},
					{
						loader: "postcss-loader",
						options: {
							sourceMap: true
						}
					},
					{
						loader: "sass-loader",
						options: {
							sourceMap: true
						}
					}
				]
			},
			// WOFF Font
			{
				test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
				use: {
					loader: "url-loader",
					options: {
						limit: 10000,
						mimetype: "application/font-woff"
					}
				}
			},
			// WOFF2 Font
			{
				test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
				use: {
					loader: "url-loader",
					options: {
						limit: 10000,
						mimetype: "application/font-woff"
					}
				}
			},
			// TTF Font
			{
				test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
				use: {
					loader: "url-loader",
					options: {
						limit: 10000,
						mimetype: "application/octet-stream"
					}
				}
			},
			// EOT Font
			{
				test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
				use: "file-loader"
			},
			// SVG Font
			{
				test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
				use: {
					loader: "url-loader",
					options: {
						limit: 10000,
						mimetype: "image/svg+xml"
					}
				}
			},
			// Common Image Formats
			{
				test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
				use: "url-loader"
			}
		]
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
		new MiniCssExtractPlugin({
			filename: "style.css"
		}),

		new BundleAnalyzerPlugin({
			analyzerMode: process.env.OPEN_ANALYZER === "true" ? "server" : "disabled",
			openAnalyzer: process.env.OPEN_ANALYZER === "true"
		}),

		new HtmlWebpackPlugin({
			filename: "./index.html",
			template: "src/index.html",
			inject: true,
			hash: false,
			minify: {
				removeComment: true,
				collapseWhitespace: true,
				removeAttributeQuotes: true
			},
			nodeModules: path.resolve(__dirname, "../node_modules")
		})
	]
});
