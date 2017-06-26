const path = require('path');
const getEntry = require('../getEntry');

const babelSettings = { extends: path.join(__dirname, '../../.babelrc') };
const fs = require('fs');

const dirname = /(.*?)\/node_modules\/.*/.exec(__dirname.replace(/\\/g, '/')) === null ?
  __dirname : /(.*?)\/node_modules\/.*/.exec(__dirname.replace(/\\/g, '/'))[1];
const babelLoader = fs.existsSync(path.join(process.env.PWD, '.babelrc')) &&
    dirname === process.env.PWD.replace(/\\/g, '/') ?
  `babel-loader` : `babel-loader?${JSON.stringify(babelSettings)}`;

module.exports = function(baseConfig) {
  if (baseConfig.babelPlugin) {
    babelSettings.plugins = baseConfig.babelPlugin;
  }
  return {
    entry: getEntry(baseConfig),
    output: {
      path: path.join(process.env.PWD, process.env.DEV_DIR, baseConfig.path),
      publicPath: '.',
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
          loader: 'null-loader'
        },
        {
          test: /\.(jpe?g|png|gif|svg|ttf|eot|woff2?)(\?.*)?$/,
          loader: 'file-loader',
          options: {
            context: path.join(process.env.PWD, 'client', baseConfig.path),
            name: '[path][name].[ext]'
          }
        }
      ]
    }
  }
}
