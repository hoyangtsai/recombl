const pathFn = require('path');
const babelConfig = require('../../resources/babel-config');

function readJson(file) {
  if (file in readJson.cache) return readJson.cache[file];
  let ret;
  try { ret = JSON.parse(readFileSync(file)); }
  catch (e) { }
  return readJson.cache[file] = ret;
}
readJson.cache = {};

module.exports = function(baseConfig) {
  let babelrc = readJson(pathFn.resolve(process.env.PWD, '.babelrc')) || {};

  let babelSettings = babelConfig(process.env.NODE_ENV);

  if (Array.isArray(baseConfig.babelPlugin)) {
    babelSettings.plugins = baseConfig.babelPlugin;
  }

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
            babelSettings,
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
    }
  };

  if (process.env.NODE_ENV === 'development') {
    let webpack = require('webpack');

    config['plugins'] = [
      new webpack.optimize.OccurrenceOrderPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin()
    ];
  }

  if (Array.isArray(baseConfig.extLoaders)) {
    baseConfig.extLoaders.map(loader => {
      config.module.rules.push(loader);
    });
  }

  return config;
}
