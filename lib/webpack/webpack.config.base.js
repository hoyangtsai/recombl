const pathFn = require('path');
const fs = require('fs');
const utilFs = require('../../util/fs');
const webpack = require('webpack');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const babelConfig = require('../../resources/babel-config');

module.exports = function(baseConfig) {
  let babelrc = utilFs.readJson(pathFn.resolve(process.env.PWD, '.babelrc')) || {};

  let config = {
    output: {
      path: pathFn.join(process.env.PWD, process.env.DEV_DIR, baseConfig.path),
      publicPath: './',
      filename: '[name].js'
    },

    module: {
      rules:[
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          options: Object.assign(
            babelConfig(process.env.NODE_ENV),
            babelrc
          )
        }
      ]
    },

    externals: {
      'react': 'React',
      'react-dom': 'ReactDOM'
    },

    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.less', '.scss', '.sass', '.styl','.css'],
      alias: baseConfig.alias,
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

    plugins: [
      new ProgressBarPlugin(),
    ]
  };

  if (process.env.NODE_ENV === 'development') {
    config['plugins'].push(
      new webpack.optimize.OccurrenceOrderPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin()
    );
  }

  if (Array.isArray(baseConfig.extLoaders)) {
    baseConfig.extLoaders.map(loader => {
      config.module.rules.push(loader);
    });
  }

  return config;
}
