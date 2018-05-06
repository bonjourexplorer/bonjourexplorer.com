// eslint-disable-next-line max-params
(function main(Config, webpack) {
    Config.webpack_styles_options.file_loader.name = '[name].css';

    // Make JS bundles ask lib.js for shared modules instead of reincluding them
    Config.webpack.plugins.push(new webpack.optimize.CommonsChunkPlugin({
        name: 'lib',
    }));

    return module.exports = Config;
}(
    require('../../webpack/config.js'),
    require('webpack'),
));
