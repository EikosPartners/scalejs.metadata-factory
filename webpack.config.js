var path = require('path');
var nodeExternals = require('webpack-node-externals');
module.exports = {
    entry: "./src/scalejs.metadataFactory.js",
    output: {
        path: 'dist',
        filename: "scalejs.metadataFactory.js"
    },
    target: 'node',
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
            }
        ]
    }
};