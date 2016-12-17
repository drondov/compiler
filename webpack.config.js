module.exports = {
	entry: './index.js',
	output: {
		path: __dirname + '/dist',
		filename: 'bundle.js'
	},
	module: {
		loaders: [{
			loader: 'babel',
			test: /\.js$/,
			query: {
				presets: ['es2015', 'react']
			},
			exclude: /node_modules|vendor/
		}]
	},
	devServer: {
		port: 8000,
		inline: true,
	},
	devtool: "source-map"
};
