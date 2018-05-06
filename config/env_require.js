// eslint-disable-next-line max-params
(function main(env) {
    return module.exports = env_require;

    function env_require(filename) {
        const environment_name = env.JS_ENV
            || env.NODE_ENV
            || env.RAILS_ENV
            || env.AWS_ENV
            ;

        let environment_dir;
        switch (environment_name) {
            case 'prod':
            case 'production':
                environment_dir = 'production';
                break;
            case 'stage':
            case 'staging':
                environment_dir = 'staging';
                break;
            case 'dev':
            case 'development':
                environment_dir = 'development';
                break;
            default:
                environment_dir = environment_name;
        }

        let required_module;
        try {
            required_module
                = require(`./environments/${ environment_dir }/${ filename }`)
                ;
        } catch (error) {
            required_module
                = require(`./environments/development/${ filename }`)
                ;
        }
        return required_module;
    }
}(
    require('process').env, // eslint-disable-line no-process-env
));
