const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const extractCSS = new ExtractTextPlugin('[name].css');
const getEntry = require('../getEntry');
const babelSettings = { extends: path.join(__dirname, '../../.babelrc') };
const argv = require('minimist')(process.argv.slice(2));

function removeArrayValue(arr, val) {
  let index = -1;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === val) {
      index = i;
      break;
    }
  }
  if (index === -1) {
    return;
  }
  arr.splice(index, 1);
}

module.exports = function(baseConfig) {
  let plugins = [];
  if (!!baseConfig.commonsChunk) {
    let comName = baseConfig.commonsChunk.name || 'common';
    let chunkObj = {
      name: comName,
      filename: `${comName}.js`
    };
    if (baseConfig.commonsChunk.minChunks) {
      chunkObj.minChunks = baseConfig.commonsChunk.minChunks;
    }
    if (Array.isArray(baseConfig.commonsChunk.excludeFile) &&
        baseConfig.commonsChunk.excludeFile.length > 0) {
      chunkObj.chunks = baseConfig.entry.slice();
      for (let j in baseConfig.commonsChunk.excludeFile) {
        removeArrayValue(chunkObj.chunks, baseConfig.commonsChunk.excludeFile[j]);
      }
    }
    plugins.push(new webpack.optimize.CommonsChunkPlugin(chunkObj));
  }

  if (argv.compress || argv.min) {
    plugins.push(new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }));
  }
  plugins.push(extractCSS);

  let config = {
    stats: {
      // minimal logging
      assets: true,
      colors: true,
      version: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      children: false
    },
    entry: getEntry(baseConfig),
    output: {
      path: path.join(process.cwd(), process.env.DEV_DIR, baseConfig.path),
      publicPath: './',
      filename: '[name].js'
    },
    module: {
      rules:[
        {
          test: /\.jsx?$/,
          exclude: new RegExp(`node_modules|${process.env.DEV_DIR}`),
          loader: `babel-loader?${JSON.stringify(babelSettings)}`
        },
        {
          test: /\.s?css$/,
          loader: extractCSS.extract({
            fallback: 'style-loader',
            use: ['css-loader', 'sass-loader']
          })
        }
      ]
    },
    plugins: plugins
  };

  if (baseConfig.postcss) {
    config['module']['rules'][1]['loader'] = extractCSS.extract({
      fallbackLoader: 'style-loader',
      use: [
        { loader: 'css-loader' },
        { loader: 'postcss-loader', options: {
          plugins: (loader) => [
            require('autoprefixer')(
              { browsers:['last 4 versions', 'Android >= 4.0', 'Chrome >= 37', 'iOS>=7'] }),
            require('postcss-flexbugs-fixes'),
            require('postcss-gradientfixer')
          ]}
        },
        { loader: 'sass-loader'}
      ]
    });
  }

  return config;
}
