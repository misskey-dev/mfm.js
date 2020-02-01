module.exports = {
	entry: './src/client/main-entry.ts',
	output: {
		path: `${__dirname}/built/client`,
		publicPath: '/', // base path of URL
		filename: 'bundle.js',
		chunkFilename: "bundle.[name].js",
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'ts-loader',
						options: { configFile: 'tsconfig.client.json' },
					},
				],
			},
		]
	},
	resolve: {
		extensions: ['.ts'],
	},
};
