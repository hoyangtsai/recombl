const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const extractCSS = new ExtractTextPlugin('[name].css');
const commonsChunk = require('../helper/commonsChunk');

module.exports = function(baseConfig) {

  if (Array.isArray(baseConfig.entry)) return;

  let entryObj = {};
  for (let key in baseConfig.entry) {
    let arr = [];
    for (let i in baseConfig.entry[key]) {
      let fileName = baseConfig.entry[key][i];
      let page = path.join(process.cwd(), baseConfig.jsPath, baseConfig.path, `${fileName}.js`);
      arr.push(page);
    }
    entryObj[key] = arr;
  }

  let plugins = [extractCSS];

  let chunkConfig = commonsChunk(baseConfig);
  if (chunkConfig) {
    plugins.push(new webpack.optimize.CommonsChunkPlugin(chunkConfig));
  }

  // if (argv.compress || argv.min) {
  //   plugins.push(new webpack.optimize.UglifyJsPlugin({
  //     compress: {
  //       warnings: false
  //     }
  //   }));
  // }

  let config = {
    entry: entryObj,

    module: {
      rules:[
        {
          test: /\.s?css$/,
          use: extractCSS.extract({
            fallback: 'style-loader',
            use: [
              { loader: 'css-loader',
                options: {
                  importLoaders: 1,
                  modules: true, // to check if needed
                  sourceMap: true,
                }
              },
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
        { loader: 'css-loader' },
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
