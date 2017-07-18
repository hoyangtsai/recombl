const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const entryMap = require('../helper/entryMap');

module.exports = function(baseConfig) {
  let plugins = [];

  // let commonsChunk = getCommonsChunk(baseConfig);
  // if (commonsChunk) {
  //   plugins.push(commonsChunk);
  // }

  // if (argv.compress || argv.min) {
  //   plugins.push(new UglifyJsPlugin({
  //     compress: {
  //       warnings: false
  //     }
  //   }));
  // }

  return {
    entry: entryMap(baseConfig),

    module: {
      rules:[
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
