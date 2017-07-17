const path = require('path');
const fs = require('fs');
const UglifyJsPlugin = require('webpack/optimize/UglifyJsPlugin');
const argv = require('optimist').argv;
const getEntry = require('../getEntry');

module.exports = function(baseConfig) {
  let plugins = [];

  let commonsChunk = getCommonsChunk(baseConfig);
  if (commonsChunk) {
    plugins.push(commonsChunk);
  }

  if (argv.compress || argv.min) {
    plugins.push(new UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }));
  }

  return {
    stats: {
      hash: false,
      chunks: false,
      chunkModules: false,
      children: false
    },
    entry: getEntry(baseConfig),

    module: {
      loaders:[
        {
          test: /\.s?css$/,
          loader: 'null-loader'
        },
        {
          test: /\.(jpe?g|png|gif|ttf|eot|woff2?)(\?.*)?$/,
          loader: 'file-loader?name=[path][name].[ext]'
        }
      ]
    },
    plugins: plugins
  }
}
