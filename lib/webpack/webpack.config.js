const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const extractCSS = new ExtractTextPlugin('[name].css');
// const argv = require('optimist').argv;
const entryMap = require('../helper/entryMap');
const commonsChunk = require('../helper/commonsChunk');

module.exports = function(baseConfig) {
  let plugins = [extractCSS];

  let chunkConfig = commonsChunk(baseConfig);
  if (chunkConfig) {
    plugins.push(new webpack.optimize.CommonsChunkPlugin(chunkConfig));
  }

  // if (this.args.m || this.args.min) {
    // plugins.push(new webpack.optimize.UglifyJsPlugin({
    //   compress: {
    //     warnings: false
    //   }
    // }));
  // }

  let config = {
    entry: entryMap(baseConfig),

    module: {
      rules: [
        {
          test: /\.s?css$/,
          use: extractCSS.extract({
            fallback: 'style-loader',
            use: [
              { loader: 'css-loader', options: { importLoaders: 1 }},
              { loader: 'sass-loader'}
            ]
          })
        }
      ]
    },

    plugins: plugins
  };

  if (baseConfig.postcss) {
    let browsers = ['last 4 versions', 'Android >= 4.0', 'Chrome >= 37', 'iOS>=7']

    config['module']['rules'][0]['use'] = extractCSS.extract({
      fallback: 'style-loader',
      use: [
        { loader: 'css-loader', options: { importLoaders: 1 }},
        {
          loader: 'postcss-loader', options: {
            plugins: (loader) => [
              require('autoprefixer')({ browsers }),
              require('postcss-flexbugs-fixes'),
              require('postcss-gradientfixer')
            ]
          }
        },
        { loader: 'sass-loader'}
      ]
    });
  }

  return config;
}
