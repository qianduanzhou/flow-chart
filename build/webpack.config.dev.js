const {
    merge
} = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {
    config: commonfig,
    resolvePath
} = require('./webpack.config.common');

module.exports = merge(commonfig, {
    mode: 'development',
    devtool: 'eval-cheap-module-source-map',
    devServer: {
        static: {
            directory: resolvePath('../test'),
        },
        open: false,
        hot: true,
        compress: true,
        port: 8080,
    },
    module: {
        rules: [],
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'js-common-util',
            filename: 'index.html',
            template: resolvePath('../test/index.html'),
        })
    ],
});