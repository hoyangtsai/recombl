const path = require('path');
const fs = require('fs');
const entryMap = require('../helper/entryMap');

module.exports = function(baseConfig) {
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
    }
  }
}
