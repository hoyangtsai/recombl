const path = require('path');
const fs = require('fs');
const UglifyJsPlugin = require('webpack/optimize/UglifyJsPlugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const extractCSS = new ExtractTextPlugin('[name].css');
const argv = require('optimist').argv;
const getEntry = require('../getEntry');

module.exports = function(baseConfig) {
  let plugins = [extractCSS];

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

  let config = {
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
          loader: extractCSS.extract(['css-loader', 'sass-loader'])
        }
      ]
    },
    plugins: plugins
  };

  if (baseConfig.postcss) {
    config['module']['loaders'][1]['loader'] =
      extractCSS.extract(['css-loader', 'postcss-loader', 'sass-loader']);

    config['postcss'] = [
      require("autoprefixer")(
        { browsers:["last 4 versions", "Android >= 4.0", "Chrome >= 37", "iOS>=7"] }),
      require("postcss-flexbugs-fixes"),
      require("postcss-gradientfixer")
    ];
  }
  return config;
}
