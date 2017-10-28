const fs = require('fs');
const pathFn = require('path');
const webpack = require('webpack');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const babelConfig = require('../babel-config');
const chalk = require('chalk');

function readJson(file) {
  if (file in readJson.cache) return readJson.cache[file];
  let ret;
  try {
    ret = JSON.parse(fs.readFileSync(file));
  } catch (e) {
    console.log(e);
    process.exit();
  }
  return readJson.cache[file] = ret;
}
readJson.cache = {};

module.exports = function(baseConfig, args) {
  let packageJson = require(pathFn.resolve(process.cwd(), 'package.json'));

  let babelrc = fs.existsSync(pathFn.resolve(process.cwd(), '.babelrc')) ?
    readJson(pathFn.resolve(process.cwd(), '.babelrc')) || {} :
    packageJson.babel || {};

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

  let externals = baseConfig.webpack && baseConfig.webpack.externals || {
    'react': 'React',
    'react-dom': 'ReactDOM'
  };

  let config = {
    context: process.cwd(),
    cache: true,

    output: {
      path: pathFn.join(process.cwd(), devDir, baseConfig.path),
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

    externals: externals,

    resolve: {
      extensions: ['.js', '.jsx', '.json', '.scss', '.sass', '.css'],
      alias: baseConfig.webpack && baseConfig.webpack.resolve.alias || baseConfig.alias,
      symlinks: false,
      modules: [
        'node_modules',
        process.env.MODULE_PATH
      ]
    },

    resolveLoader: {
      modules: [
        process.env.MODULE_PATH,
        pathFn.resolve(process.cwd(), 'node_modules')
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
