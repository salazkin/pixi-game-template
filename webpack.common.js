const path = require('path');
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const webpack = require('webpack');

module.exports = {
    entry: path.join(__dirname, 'src/index.ts'),
    resolve: {
        extensions: ['.ts', '.js'],
        modules: ["node_modules", "src"],
        plugins: [new TsconfigPathsPlugin({extensions: [".ts", ".js", ".json"]})]
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'index.js',
    },
    module: {
        rules: [
            {test: /\.ts$/, loader: 'ts-loader', exclude: '/node_modules/'}
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            PIXI: 'pixi.js'
        }),
        new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: [
                '**/*',
                '!index.html'
            ]
        }),
        new CopyPlugin({
            patterns: [
                {from: "res/atlases/*.*"},
                {from: "res/fonts/*.*"},
                {from: "res/i18n/*.json"},
                {from: "res/sounds/*.*"},
                {from: "res/images/*.*"},
                {from: "res/spine/", to: "res/spine/"},
                {from: "res/version.json", to: "res"}
            ]
        })
    ]
};
