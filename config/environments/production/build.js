// eslint-disable-next-line max-params
(function main(Config, webpack, asset_suppressor) {
    // Name JS bundles according the hash of their contents
    Config.webpack.output.filename = '[chunkhash].js';

    // Make JS bundles ask lib.js for shared modules instead of reincluding them
    // And use a manifest file to broker communication with lib.js,
    // so lib.js's hash/filename doesn't change everytime any JS file changes
    Config.webpack.plugins.push(new webpack.optimize.CommonsChunkPlugin({
        names: [ 'lib', 'manifest' ],
    }));

    // Don't save the assets bundle since the HTML/CSS/images are extracted out
    Config.webpack.plugins.push(asset_suppressor('assets'));

    return module.exports = Config;
}(
    require('../../webpack/config.js'),
    require('webpack'),
    require('asset-suppressor-webpack-plugin'),
));
