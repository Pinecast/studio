const path = require('path');

const webpack = require('webpack');


module.exports = {
    devtool: 'source-maps',
    entry: {
        app: ['./src/index.js']
    },
    resolve: {
        mainFields: [
            'jsnext:main',
            'main',
        ],
    },
    cache: false,
    output: {
        path: path.resolve(__dirname, 'build'),
        publicPath: '/',
        filename: '/build.js',
    },
    plugins: [
        // new webpack.DefinePlugin({
        //     'process.env.NODE_ENV': '"production"',
        // }),
        // new webpack.optimize.UglifyJsPlugin({
        //     compress: {warnings: false},
        //     mangle: {},
        //     sourceMap: false,
        // }),
        new webpack.LoaderOptionsPlugin({
            minimize: true,
        }),
    ],
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    externals: [
        function(context, request, callback) {
            if (request === 'electron') {
                return callback(null, "require('" + request + "')");
            }
            if (request.substr(0, 9) === 'external:') {
                return callback(null, "require('" + request.substr(9) + "')");
            }
            return callback();
        }
    ],
};
