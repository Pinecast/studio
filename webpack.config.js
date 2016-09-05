var path = require('path');

var webpack = require('webpack');


module.exports = {
    devtool: 'source-maps',
    entry: {
        app: ['./src/index.js']
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        publicPath: '/',
        filename: '/build.js',
    },
    plugins: [
        // new webpack.DefinePlugin({
        //     'process.env': {
        //         'NODE_ENV': '"production"',
        //     },
        // }),
        // new webpack.optimize.UglifyJsPlugin({
        //     compress: {warnings: false},
        //     mangle: {},
        //     sourceMap: false,
        // }),
        new webpack.optimize.DedupePlugin(),
    ],
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
            },
        ],
    },
    externals: [
        function(context, request, callback) {
            if (request === 'electron') {
                return callback(null, "require('" + request + "')");
            }
            return callback();
        }
    ],
};
