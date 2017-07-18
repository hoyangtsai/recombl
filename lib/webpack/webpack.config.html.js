const pathFn = require('path');
const fs = require('fs');
const entryMap = require('../helper/entryMap');

module.exports = function(baseConfig) {
  return {
    entry: entryMap(baseConfig),

    output: {
      path: pathFn.join(process.env.PWD, process.env.DEV_DIR, 'ssr', baseConfig.path)
    },

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
    target: 'node'
  }
}
