// eslint-disable-next-line max-params
(function main(Settings, webpack, path) {
    const Config = {
        source_path: path.join(__dirname, '../../source'),
        target_path: path.join(__dirname, '../../target', Settings.build_dir),
        public_path: Settings.public_path,
    };

    Config.webpack = {
        context: Config.source_path,
        entry: {
            index: '../config/webpack/entry-points/index.js',
            lib: '../config/webpack/entry-points/lib.js',
            styles: '../config/webpack/entry-points/index.css.js',
            markup: '../config/webpack/entry-points/index.html.js',
        },
        resolve: { extensions: [ '.js', '.jsx', '.json' ] },
        output: {
            filename: '[name].js',
            path: Config.target_path,
            publicPath: Config.public_path,
        },
        plugins: [],
        module: { rules: [] },
        devtool: 'source-map',
        devServer: {
            contentBase: Config.target_path,
            compress: true,
            port: 9000,
            historyApiFallback: true, // route everything to index.html
        },
    };

    config_scripts();
    config_styles();
    config_markup();
    config_images();

    Config.webpack.plugins.push(asset_injector_webpack_plugin());

    return module.exports = Config;

    // -----------

    function config_scripts() {
        // In an environment build.js file, override:
        //   - the scripts rule at Config.webpack_scripts_rule
        //   - loader options at Config.webpack_scripts_rule.LOADER_NAME
        Config.webpack_scripts_options = {};
        return Config.webpack.module.rules.push(Config.webpack_scripts_rule = {
            test: /\.jsx?$/,

            // Webpack executes loaders in reverse order
            loaders: [

                // Mocha: Run automated tests

                // Babel: Transpile JSX and ES2015+ down to native ES5
                {
                    loader: 'babel-loader',
                    options: Config.webpack_scripts_options.babel_loader = {
                        presets: [ 'react', 'es2015' ],
                    },
                },

                // ESLint: Statically anaylize JavaScript using .eslintrc.yml
                {
                    loader: 'eslint-loader',
                    options: Config.webpack_scripts_options.eslint_loader = {
                        fix: false, // auto-fix fucks up logical chaining
                        failOnWarning: false, // do not block build if warnings
                        failOnError: true, // block build if errors
                    },
                },
            ],
        });
    }

    function config_styles() {
        // In an environment build.js file, override:
        //   - the scripts rule at Config.webpack_styles_rule
        //   - loader options at Config.webpack_styles_rule.LOADER_NAME
        Config.webpack_styles_options = {};
        return Config.webpack.module.rules.push(Config.webpack_styles_rule = {
            test: /\.css$/,

            // Webpack executes loaders in reverse order
            loaders: [
                {
                    loader: 'file-loader',
                    options: Config.webpack_styles_options.file_loader = {},
                },
                'extract-loader',
                {
                    loader: 'css-loader',
                    options: Config.webpack_styles_options.css_loader = {
                        sourceMap: true,
                        importLoaders: 1,
                    },
                },
                // URL loader to convert small images to data URIs
                {
                    loader: 'postcss-loader',
                    options: Config.webpack_styles_options.postcss_loader = {
                        sourceMap: true,
                        plugins: load_postcss_plugins,
                    },
                },
                // Lint
            ],
        });

        // -----------

        function load_postcss_plugins() {
            return [
                require('postcss-easy-import')({
                    root: Config.source_path,
                }),
                require('precss'),
                require('autoprefixer'),
            ];
        }
    }

    function config_markup() {
        // In an environment build.js file, override:
        //   - the scripts rule at Config.webpack_markup_rule
        //   - loader options at Config.webpack_markup_rule.LOADER_NAME
        Config.webpack_markup_options = {};
        Config.webpack.module.rules.push(Config.webpack_markup_rule = {
            enforce: 'post',
            test: /\.html$/,

            // Webpack executes loaders in reverse order
            loaders: [
                {
                    loader: 'file-loader',
                    options: Config.webpack_markup_options.file_loader = {
                        name: 'index.html',
                    },
                },
                'extract-loader',
                {
                    loader: 'html-loader',
                    options: Config.webpack_markup_options.html_loader = {
                        root: Config.source_path,
                        attrs: [ 'img:src' ],
                    },
                },
            ],
        });
    }

    function config_images() {
        // In an environment build.js file, override:
        //   - the scripts rule at Config.webpack_images_rule
        //   - loader options at Config.webpack_images_rule.LOADER_NAME
        Config.webpack_images_options = {};
        Config.webpack.module.rules.push(Config.webpack_images_rule = {
            test: /\.(jpg|png|gif|svg)$/,
            loader: {
                loader: 'file-loader',
                options: Config.webpack_images_options.file_loader = {},
            },
        });
    }

    // -----------

    function asset_injector_webpack_plugin() {
        const package_name = 'asset-injector-webpack-plugin';
        return asset_injector;

        // -----------

        function asset_injector() {
            const compiler = this; // eslint-disable-line
            return compiler instanceof webpack.Compiler
                && compiler.plugin('after-compile', inject_asset_references)
                ;
        }

        function inject_asset_references(compilation, callback) {
            const assets_dict = compilation.assets;
            const public_path = compilation.outputOptions.publicPath;
            const token_dict = {};
            for (let i = 0, n = compilation.chunks.length - 1; i <= n; i++) {
                const chunk = compilation.chunks[i];
                const assets = chunk.modules
                    .reduce(reduce_modules_to_asset_array, [])
                    ;
                const output_file_names = chunk.files
                    .concat(assets)
                    .map(map_output_file_names)
                    ;
                // ^ should be primary asset, this is probably not always right
                token_dict[chunk.name] = output_file_names;
            }
            for (const filename in assets_dict) {
                if ('.html' === filename.substr(-5)) {
                    assets_dict[filename] = parse_html_asset({
                        asset: assets_dict[filename],
                        token_dict,
                        }); // eslint-disable-line
                }
            }
            return callback && callback();



            function reduce_modules_to_asset_array(assets, module) {
                return module.assets
                    ? assets.concat(Object.keys(module.assets))
                    : assets
                    ;
            }
            function map_output_file_names(file_name) {
                return `${ public_path }${ file_name }`;
            }
        }

        function parse_html_asset(params) {
            const token_dict = params.token_dict;
            let parsed_html_string = params.asset.source().toString('utf-8');
            for (const token in token_dict) {
                if ({}.hasOwnProperty.call(token_dict, token)) {
                    const assets = token_dict[token];
                    replace_token({
                        token,
                        ext: 'css',
                        assets,
                        replacement_pattern:
                            '<link rel="stylesheet" href="XXX"/>'
                            ,
                    });
                    replace_token({
                        token,
                        ext: 'js',
                        assets,
                        replacement_pattern: '<script src="XXX"></script>',
                    });
                }
            }
            parsed_html_string = parsed_html_string.replace(
                new RegExp(`<!--\\s*${ package_name }\\s+.+-->`, 'g'),
                '',
                );
            const parsed_html_buffer = Buffer.from(parsed_html_string, 'utf-8');
            return new params.asset.constructor(parsed_html_buffer);

            // -----------

            function replace_token(replace_token_params) {
                const token = replace_token_params.token;
                const ext = replace_token_params.ext;
                const assets = replace_token_params.assets;
                const replacement_pattern
                    = replace_token_params.replacement_pattern
                    ;
                const regex_injection_point = new RegExp(
                    `<!--\\s*${ package_name }\\s+${ token }\\.${ ext }\\s*-->`,
                    'g',
                    );
                if (regex_injection_point.test(parsed_html_string)) {
                    for (let i = 0, n = assets.length - 1; i <= n; i++) {
                        const asset = assets[i];
                        if (`.${ ext }` === asset.substr(
                            -1 * (ext.length + 1),
                            )) {
                            const replacement
                                = replacement_pattern.replace('XXX', asset)
                                ;
                            parsed_html_string = parsed_html_string.replace(
                                regex_injection_point,
                                `${ replacement }$&`,
                                );
                        }
                    }
                }
            }
        }
    }
}(
    require('../env_require.js')('settings.json'),
    require('webpack'),
    require('path'),
));
