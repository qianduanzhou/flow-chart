const {
    merge
} = require('webpack-merge');
const {
    CleanWebpackPlugin
} = require('clean-webpack-plugin');
const {
    config: commonfig,
    resolvePath
} = require('./webpack.config.common');

module.exports = merge(commonfig, {
    mode: 'production',
    devtool: false,
    output: {
        libraryTarget: "commonjs-module", //导出模块
        environment: {//webpack5打包粒度更细，打包后的代码是否支持es6语法需要在这配置
            // The environment supports arrow functions ('() => { ... }').
            arrowFunction: false,
            // The environment supports BigInt as literal (123n).
            bigIntLiteral: false,
            // The environment supports const and let for variable declarations.
            const: false,
            // The environment supports destructuring ('{ a, b } = obj').
            destructuring: false,
            // The environment supports an async import() function to import EcmaScript modules.
            dynamicImport: false,
            // The environment supports 'for of' iteration ('for (const x of array) { ... }').
            forOf: false,
            // The environment supports ECMAScript Module syntax to import ECMAScript modules (import ... from '...').
            module: false,
        }
    },
    optimization: {
        minimize: true, // 开启代码压缩
    },
    module: {
        rules: [],
    },
    plugins: [
        new CleanWebpackPlugin(), // 编译之前清空 /dist
    ]
});