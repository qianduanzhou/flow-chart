const path = require('path');

const resolvePath = (filePath) => {
    return path.resolve(__dirname, filePath)
}

const config = {
    entry: resolvePath('../src/index.ts'),
    output: {
        filename: 'bundle.js',
        path: resolvePath('../dist'),
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        alias: {
            '@': resolvePath("../src"),
            'core': resolvePath('../src/core')
        }
    },
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/,
        }, {
            test: /\.m?js$/,
            exclude: /(node_modules|bower_components)/,
            use: 'babel-loader'
        }],
    },
    plugins: []
}

module.exports = { resolvePath, config };