module.exports = {
    entry: "./src/scalejs.metadataFactory.js",
    output: {
        path: 'dist',
        filename: "bundle.js"
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" }
        ]
    }
};