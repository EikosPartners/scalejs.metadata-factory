var path = require('path'),
    nodeExternals = require('webpack-node-externals');
module.exports = {
    entry: "./src/scalejs.metadataFactory.js",
    resolve: {
        alias: {
            // scalejs
            'scalejs.core': path.join(__dirname, 'node_modules/scalejs/dist/scalejs.core.js'),
            'scalejs.sandbox': path.join(__dirname, 'node_modules/scalejs/dist/scalejs.sandbox.js'),

            // extensions
            'scalejs.extensions': path.join(__dirname, 'src/extensions/scalejs.extensions.js')
        }
    },
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
                exclude: /\.html?$/, // add exclude node modules
                query: {
                    presets: 'es2015',
                }
            }
        ]
    }
};