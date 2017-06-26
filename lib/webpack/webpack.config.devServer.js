const path = require('path');
const getEntry = require('../getEntry');
const webpack = require('webpack');

const babelSettings = { extends: path.join(__dirname, '../../.babelrc') };
const fs = require('fs');

const dirname = /(.*?)\/node_modules\/.*/.exec(__dirname.replace(/\\/g, '/')) === null ?
  __dirname : /(.*?)\/node_modules\/.*/.exec(__dirname.replace(/\\/g, '/'))[1];
const babelLoader = fs.existsSync(path.join(process.env.PWD, '.babelrc')) &&
    dirname === process.env.PWD.replace(/\\/g, '/') ?
  `babel-loader` : `babel-loader?${JSON.stringify(babelSettings)}`;

module.exports = function(baseConfig) {
  let entryObj = getEntry(baseConfig);
  if (baseConfig.babelPlugin) {
    babelSettings.plugins = baseConfig.babelPlugin;
  }
  let config = {
    entry: entryObj,
    output: {
      path: path.join(process.env.PWD, process.env.DEV_DIR, baseConfig.path),
      publicPath: `http://localhost:${process.env.SERVER_PORT}/${process.env.DEV_DIR}/`,
      filename: '[name].js'
    },

    module: {
      rules:[
        {
          test: /\.jsx?$/,
          exclude: new RegExp(`node_modules|${process.env.DEV_DIR}`),
          loader: babelLoader
        },
        {
          test: /\.s?css$/,
          use: [
            'style-loader',
            'css-loader',
            'sass-loader'
          ]
        }
      ]
    },
    devtool: 'eval',
    plugins: [
      new webpack.optimize.OccurrenceOrderPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin()
    ]
  };

  if (baseConfig.postcss) {
    config['module']['rules'][1]['use'] = [
      'style-loader',
      { loader: 'css-loader', options: { importLoaders: 1 }},
      { loader: 'postcss-loader', options: {
        plugins: (loader) => [
          require('autoprefixer')(
            { browsers: ['last 4 versions', 'Android >= 4.0', 'Chrome >= 37', 'iOS>=7'] }),
          require('postcss-flexbugs-fixes'),
          require('postcss-gradientfixer')
        ]}
      },
      'sass-loader'
    ]
  }

  return config;
}
