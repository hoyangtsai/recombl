const fs = require('fs');
const pathFn = require('path');
const utilFs = require('../../util/fs');
const webpack = require('webpack');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const babelConfig = require('../../resources/babel-config');
const chalk = require('chalk');

module.exports = function(baseConfig, args) {
  let babelrc = utilFs.readJson(pathFn.resolve(process.env.PWD, '.babelrc')) || {};
  let plugins = [];
  let stats = {};
  let devDir = baseConfig.devDirectory || '_tmp';

  if (process.env.NODE_ENV === 'development') {
    plugins = [
      new webpack.optimize.OccurrenceOrderPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin()
    ];
  } else {
    plugins = [
      new ProgressBarPlugin({
        format: 'build [:bar] ' + chalk.green.bold(':percent') +
          ' (:elapsed seconds) ' + chalk.gray(':msg'),
        renderThrottle: 100,
        clear: false
      })
    ];

    if (args.m || args.minify) {
      plugins.push(
        new webpack.optimize.UglifyJsPlugin({
          compress: { warnings: false }
        })
      );
    }

    stats = {
      hash: false,
      chunks: false,
      chunkModules: false,
      children: false
    };
  }

  plugins.push(new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  }))

  let config = {
    context: process.env.PWD,
    cache: true,

    output: {
      path: pathFn.join(process.env.PWD, devDir, baseConfig.path),
      publicPath: './',
      filename: '[name].js'
    },

    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: Object.assign(
                babelConfig(process.env.NODE_ENV),
                babelrc
              )
            }
          ]
        }
      ]
    },

    externals: {
      'react': 'React',
      'react-dom': 'ReactDOM'
    },

    resolve: {
      extensions: ['.js', '.jsx', '.json', '.scss', '.sass', '.css'],
      alias: baseConfig.alias,
      symlinks: false,
      modules: [
        'node_modules',
        process.env.MODULE_PATH
      ]
    },

    resolveLoader: {
      modules: [
        process.env.MODULE_PATH,
        pathFn.resolve(process.env.PWD, 'node_modules')
      ]
    },

    plugins: plugins,
    stats: stats
  };

  if (Array.isArray(baseConfig.extLoaders)) {
    baseConfig.extLoaders.map(loader => {
      config.module.rules.push(loader);
    });
  }

  return config;
}
