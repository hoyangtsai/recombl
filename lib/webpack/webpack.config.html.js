const path = require('path');
const getEntry = require('../getEntry');
const babelSettings = { extends: path.join(__dirname, '../../.babelrc') };
const fs = require('fs');

module.exports = function(baseConfig) {
  if (baseConfig.babelPlugin) {
    babelSettings.plugins = baseConfig.babelPlugin;
  }
  return {
    entry: getEntry(baseConfig),
    output: {
      path: path.join(process.cwd(), process.env.DEV_DIR, baseConfig.path),
      publicPath: '.',
      filename: '[name].js'
    },
    module: {
      loaders:[
        {
          test: /\.jsx?$/,
          exclude: new RegExp(`node_modules|${process.env.DEV_DIR}`),
          loader: fs.existsSync(path.join(process.env.PWD, '.babelrc')) ?
            `babel-loader` : `babel-loader?${JSON.stringify(babelSettings)}`
        },
        {
          test: /\.s?css$/,
          loader: 'null-loader'
        },
        {
          test: /\.(svg|ttf|eot|woff2?)(\?.*)?$/,
          loader: 'file-loader?name=[path][name].[ext]'
        }
      ]
    }
  }
}
