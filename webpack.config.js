var path = require('path');
var webpack = require('webpack');

var output = __dirname;
var publicPath = '/dist/';

var plugins = [
    new webpack.DefinePlugin({
        __DEV__: process.env.NODE_ENV !== 'production',
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
];

module.exports = {
    devtool: "source-map",
    entry: [
      path.join(__dirname, 'lib/index.js')
    ],
    output: {
        path: path.join(output, publicPath),
        filename: 'bundle.js',
        publicPath: publicPath
    },
    resolve: {
        extensions: ['', '.js']
    },
    module: {
        preLoaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'eslint'
            }
        ],
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel'
            }
        ]
    },
    plugins: plugins
};
