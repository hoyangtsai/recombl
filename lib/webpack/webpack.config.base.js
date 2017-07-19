const fs = require('fs');
const pathFn = require('path');
const utilFs = require('../../util/fs');
const webpack = require('webpack');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const babelConfig = require('../../resources/babel-config');
const chalk = require('chalk');
const HappyPack = require('happypack');

module.exports = function(baseConfig, args) {
  let babelrc = utilFs.readJson(pathFn.resolve(process.env.PWD, '.babelrc')) || {};

  let plugins = [];

  if (process.env.NODE_ENV === 'development') {
    plugins = [
      new webpack.optimize.OccurrenceOrderPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin()
    ]
  } else {
    plugins = [
      new ProgressBarPlugin({
        format: 'build [:bar] ' + chalk.green.bold(':percent') +
          ' (:elapsed seconds) ' + chalk.gray(':msg'),
        renderThrottle: 100,
        clear: false
      })
    ]
  }

  let rules = [];
  if (process.env.NODE_ENV === 'production') {
    if (args.p || args.parallel) {
      plugins.push(
        new HappyPack({
          id: 'js',
          threads: 2,
          loaders: [
            {
              loader: 'babel-loader',
              options: Object.assign(
                babelConfig(process.env.NODE_ENV),
                babelrc
              )
            }
          ]
        }),
      )
      rules = [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          loader: 'happypack/loader?id=js'
        }
      ]
    } else {
      rules = [
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
    }

    if (args.m || args.minify) {
      plugins.push(
        new webpack.optimize.UglifyJsPlugin({
          compress: {
            warnings: false
          }
        })
      );
    }
  }

  let config = {
    context: process.env.PWD,
    cache: true,

    output: {
      path: pathFn.join(process.env.PWD, process.env.DEV_DIR, baseConfig.path),
      publicPath: './',
      filename: '[name].js'
    },

    module: {
      rules: rules
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

    plugins: plugins
  };

  if (process.env.NODE_ENV === 'production') {
    config['stats'] = {
      hash: false,
      chunks: false,
      chunkModules: false,
      children: false
    };
  }

  if (Array.isArray(baseConfig.extLoaders)) {
    baseConfig.extLoaders.map(loader => {
      config.module.rules.push(loader);
    });
  }

  return config;
}
