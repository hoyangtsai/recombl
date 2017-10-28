const fs = require('fs');
const pathFn = require('path');
const webpack = require('webpack');
const entryMap = require('../helper/entryMap');

module.exports = function(baseConfig, args) {
  let plugins = [
    new webpack.DefinePlugin({
      PRODUCTION: JSON.stringify(process.env.NODE_ENV),
      NODE_ENV: JSON.stringify(process.env.NODE_ENV)
    })
  ];

  let devDir = baseConfig.devDirectory || '_tmp';

  let entries = entryMap(baseConfig);

  if (args.hasRouter) {
    for (let key in entries) {
      entries[key] += 'x';
    }
  }

  return {
    entry: entries,

    output: {
      path: pathFn.join(process.env.PWD, devDir, 'ssr', baseConfig.path)
    },

    module: {
      rules:[
        {
          test: /\.scss$/,
          loader: 'null-loader'
        },
        {
          test: /\.(jpe?g|png|gif|ttf|eot|woff2?)(\?.*)?$/,
          loader: 'file-loader',
          options: {
            name: '[path][name].[ext]'
          }
        }
      ]
    },

    plugins: plugins,
    target: 'node'
  }
}
