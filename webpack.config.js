var path = require('path');
module.exports = {
    entry: "./src/scalejs.metadataFactory.js",
    output: {
        path: 'dist',
        filename: "scalejs.metadataFactory.js"
    },
     resolve: {
        alias: {
            'scalejs.core': path.join(__dirname, 'node_modules/scalejs/dist/scalejs.core.js')
        }
    },
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