const path = require('path');
const fs = require('fs');
const getEntry = require('../getEntry');

module.exports = function(baseConfig) {
  let dirname = /(.*?)\/node_modules\/.*/.exec(__dirname.replace(/\\/g, '/')) === null ?
    __dirname : /(.*?)\/node_modules\/.*/.exec(__dirname.replace(/\\/g, '/'))[1];

  let babelSettings;
  if (fs.existsSync(path.join(process.env.PWD, '.babelrc')) &&
    dirname === process.env.PWD.replace(/\\/g, '/')) {
    babelSettings = { extends: path.join(process.env.PWD, '.babelrc') };
  } else {
    babelSettings = { extends: path.join(__dirname, '../../.babelrc') };
  }

  if (baseConfig.babelPlugin && Array.isArray(baseConfig.babelPlugin)) {
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
      loaders:[
        {
          test: /\.jsx?$/,
          exclude: new RegExp(`node_modules|${process.env.DEV_DIR}`),
          loader: `babel-loader?${JSON.stringify(babelSettings)}`
        },
        {
          test: /\.s?css$/,
          loader: 'null-loader'
        },
        {
          test: /\.(jpe?g|png|gif|ttf|eot|woff2?)(\?.*)?$/,
          loader: 'file-loader?name=[path][name].[ext]'
        }
      ]
    }
  }
}
