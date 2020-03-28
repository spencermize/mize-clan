const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const VueLoaderPlugin = require("vue-loader/lib/plugin");

module.exports = {
	mode: "development",
	watch: true,
	entry: {
		script: "./src/ts/script.ts"
	},
	output: {
		path: path.resolve(__dirname, "./public/build"),
		filename: "script.js"
	},
	resolve: {
		extensions: [".ts", ".tsx", ".js", ".json", ".vue"],
		alias: {
			vue: "vue/dist/vue.js"
		}
	},
	devtool: "source-map",
	module: {
		rules: [
			{ test: /\.tsx?$/, loader: "babel-loader" },
			{
				test: /\.tsx?$/,
				use: [
					{
						loader: "ts-loader",
						options: {
							transpileOnly: true
						}
					}
				]
			},
			{
				test: /\.(sa|sc|c)ss$/i,
				use: [
					{
						loader: MiniCssExtractPlugin.loader
					},
					"css-loader",
					{
						loader: "sass-loader",
						options: {
							implementation: require("dart-sass")
						}
					}
				]
			},
			{
				test: /\.vue$/,
				loader: "vue-loader"
			}
		]
	},
	plugins: [
		new MiniCssExtractPlugin({
			// Options similar to the same options in webpackOptions.output
			// both options are optional
			filename: "style.css"
		}),
		new VueLoaderPlugin()
	]
};
