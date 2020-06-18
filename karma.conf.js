const webpackConfig = require('./webpack.dev.config');

module.exports = function(config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine'],

        files: ['test/*.ts', 'test/*.js'],

        exclude: [],

        preprocessors: {
            'test/**/*.ts': ['webpack'],
            'test/**/*.js': ['webpack'],
        },
        webpack: {
            module: webpackConfig.module,
            resolve: webpackConfig.resolve,
            mode: webpackConfig.mode,
            devtool: 'inline-source-map',
        },
        reporters: ['spec'],
        
        port: 9876,

        colors: true,

        // level of logging
        // config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_WARN,

        autoWatch: true,
        browsers: ['Chrome'],
        singleRun: false,
        
        concurrency: Infinity,
    });
};
