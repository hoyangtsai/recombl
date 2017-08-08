const fs = require('fs');
const pathFn = require('path');
const webpack = require('webpack');
const entryMap = require('../helper/entryMap');
// const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function(baseConfig, args) {
  let plugins = [
    new webpack.DefinePlugin({
      PRODUCTION: JSON.stringify(process.env.NODE_ENV),
      NODE_ENV: JSON.stringify(process.env.NODE_ENV)
    })
  ];

  // if (Array.isArray(baseConfig.entry)) {
  //   baseConfig.entry.map(page => {
  //     plugins.push(new HtmlWebpackPlugin());
  //   })
  // } else {
  //   Object.keys(baseConfig.entry).map(key => {
  //     baseConfig.entry[key].map(page => {
  //       plugins.push(new HtmlWebpackPlugin());
  //     })
  //   })
  // }

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
          test: /\.s?css$/,
          loader: 'null-loader'
        },
        {
          test: /\.(jpe?g|png|gif|ttf|eot|woff2?)(\?.*)?$/,
          loader: 'file-loader?name=[path][name].[ext]'
        }
      ]
    },

    plugins: plugins,
    target: 'node'
  }
}
