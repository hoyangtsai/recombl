const fs = require('fs');
const pathFn = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const extractCSS = new ExtractTextPlugin('[name].css');
const entryMap = require('../helper/entryMap');
const commonsChunk = require('../helper/commonsChunk');

module.exports = function(baseConfig) {
  let plugins = [extractCSS];

  let chunkConfig = commonsChunk(baseConfig);
  if (chunkConfig) {
    plugins.push(new webpack.optimize.CommonsChunkPlugin(chunkConfig));
  }

  let styLoader = [
    {
      loader: 'cache-loader',
      options: {
        cacheDirectory: pathFn.resolve(process.env.PWD, '.cache')
      }
    },
    {
      loader: 'css-loader',
      options: {
        importLoaders: 1,
        sourceMap: true
      }
    }
  ];
  if (baseConfig.postcss) {
    let browsers = ['last 4 versions', 'Android >= 4.0', 'Chrome >= 37', 'iOS>=7']
    styLoader.push({
      loader: 'postcss-loader', options: {
        plugins: (loader) => [
          require('autoprefixer')({ browsers }),
          require('postcss-flexbugs-fixes'),
          require('postcss-gradientfixer')
        ]
      }
    })
  }
  styLoader.push('sass-loader');

  return {
    entry: entryMap(baseConfig),
    module: {
      rules: [
        {
          test: /\.s?css$/,
          use: extractCSS.extract({
            fallback: 'style-loader',
            use: styLoader
          })
        }
      ]
    },
    plugins: plugins
  }
}
