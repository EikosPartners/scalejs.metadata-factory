var path = require('path'),
    nodeExternals = require('webpack-node-externals');
module.exports = {
    entry: "./src/scalejs.metadataFactory.js",
    output: {
        path: 'dist',
        filename: 'scalejs.metadataFactory.js'
    },
    externals: [nodeExternals()],
    module: {
        loaders: [
            {
                loader: 'babel-loader',
                test: [
                    path.join(__dirname, 'src')
                ],
                exclude: /\.html?$/,
                query: {
                    presets: 'es2015',
                }
            },
             {
                test: /\.html$/,
                loader: 'html-loader'
            }
        ]
    }
};