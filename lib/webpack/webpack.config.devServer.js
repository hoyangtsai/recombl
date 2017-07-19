const path = require('path');
const entryMap = require('../helper/entryMap');
const fs = require('fs');

module.exports = function(baseConfig) {
  let config = {
    entry: entryMap(baseConfig),
    output: {
      publicPath: `http://localhost:${process.env.SERVER_PORT}/${process.env.DEV_DIR}/`
    },

    module: {
      rules:[
        {
          test: /\.s?css$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: { importLoaders: 1 }
            },
            'sass-loader'
          ]
        }
      ]
    },

    devtool: 'eval'
  };

  if (baseConfig.postcss) {
    let browsers = ['last 4 versions', 'Android >= 4.0', 'Chrome >= 37', 'iOS>=7'];

    config['module']['rules'][0]['use'] = [
      'style-loader',
      { loader: 'css-loader', options: { importLoaders: 1 }},
      { loader: 'postcss-loader', options: {
        plugins: (loader) => [
          require('autoprefixer')({ browsers }),
          require('postcss-flexbugs-fixes'),
          require('postcss-gradientfixer')
        ]}
      },
      'sass-loader'
    ]
  }

  return config;
}
