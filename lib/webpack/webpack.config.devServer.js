const pathFn = require('path');
const entryMap = require('../helper/entryMap');
const fs = require('fs');

module.exports = function(baseConfig) {
  let styLoader = [
    {
      loader: 'cache-loader',
      options: {
        cacheDirectory: pathFn.resolve(process.env.PWD, '.cache')
      }
    },
    'style-loader',
    {
      loader: 'css-loader',
      options: {
        importLoaders: 1
      }
    }
  ];
  if (baseConfig.postcss) {
    let browsers = baseConfig.browserList ||
      ['last 4 versions', 'Android >= 4.0', 'Chrome >= 37', 'iOS>=7'];
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
    output: {
      publicPath: `http://localhost:${process.env.SERVER_PORT}/${process.env.DEV_DIR}/`
    },
    module: {
      rules:[
        {
          test: /\.s?css$/,
          use: styLoader
        }
      ]
    },

    devtool: 'eval'
  }
}
