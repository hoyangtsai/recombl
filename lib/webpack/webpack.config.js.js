const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const entryMap = require('../helper/entryMap');
const commonsChunk = require('../helper/commonsChunk');

module.exports = function(baseConfig) {
  let plugins = [];

  let chunkConfig = commonsChunk(baseConfig);
  if (chunkConfig) {
    plugins.push(new webpack.optimize.CommonsChunkPlugin(chunkConfig));
  }

  return {
    entry: entryMap(baseConfig),

    module: {
      rules:[
        {
          test: /\.scss$/,
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
