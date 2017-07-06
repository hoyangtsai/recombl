const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const argv = require('optimist').argv;
const getEntry = require('../getEntry');

module.exports = function(baseConfig) {
  let dirname = /(.*?)\/node_modules\/.*/.exec(__dirname.replace(/\\/g, '/')) === null ?
    __dirname : /(.*?)\/node_modules\/.*/.exec(__dirname.replace(/\\/g, '/'))[1];

  let babelSettings;
  if (fs.existsSync(path.join(process.env.PWD, '.babelrc')) &&
    dirname === process.env.PWD.replace(/\\/g, '/')) {
    babelSettings = { extends: path.join(process.env.PWD, '.babelrc') };
  } else {
    babelSettings = { extends: path.join(__dirname, '../../.babelrc') };
  }

  if (baseConfig.babelPlugin && Array.isArray(baseConfig.babelPlugin)) {
    babelSettings.plugins = baseConfig.babelPlugin;
  }

  let plugins = [];
  if (!!baseConfig.commonsChunk && baseConfig.entry && baseConfig.entry.length > 1) {
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

  return {
    stats: {
      hash: false,
      chunks: false,
      chunkModules: false,
      children: false
    },
    entry: getEntry(baseConfig),
    output: {
      path: path.join(process.env.PWD, process.env.DEV_DIR, baseConfig.path),
      publicPath: './',
      filename: '[name].js'
    },
    module: {
      loaders:[
        {
          test: /\.jsx?$/,
          exclude: new RegExp(`node_modules|${process.env.DEV_DIR}`),
          loader: `babel-loader?${JSON.stringify(babelSettings)}`
        },
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
    plugins: plugins
  }
}

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
