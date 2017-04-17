const path = require('path');
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const getEntry = require('./getEntry');

module.exports = function(baseConfig) {
  let entryObj = getEntry(baseConfig);

  let pluginsObj = [];
  if (baseConfig.entry && !!baseConfig.commonsChunk) {
    let comName = (baseConfig.commonsChunk && baseConfig.commonsChunk.name) || 'common';
    let chunkObj = {
      name: comName,
      filename: comName + '.js'
    };
    if (baseConfig.commonsChunk && baseConfig.commonsChunk.minChunks) {
      chunkObj.minChunks = baseConfig.commonsChunk.minChunks;
    }
    if (baseConfig.commonsChunk.excludeFile && baseConfig.commonsChunk.excludeFile.length > 0) {
      chunkObj.chunks = baseConfig.entry.slice();
      for (let j in baseConfig.commonsChunk.excludeFile) {
        removeArrayValue(chunkObj.chunks, baseConfig.commonsChunk.excludeFile[j]);
      }
    }
    pluginsObj.push(new CommonsChunkPlugin(chunkObj));
  }

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

    entry: entryObj,
    output: {
      path: path.join(process.cwd(), process.env.DEV_DIR, baseConfig.path),
      publicPath: '.',
      filename: '[name].js'
    },
    module: {
      loaders:[
        {
          test: /\.jsx?$/,
          exclude: /node_modules|dist/,
          loader: 'babel',
          query: {
            "cacheDirectory": true,
            "compact": false,
            "comments": false,
            "plugins": [
              "transform-runtime"
            ]
          }
        },
        {
          test: /\.scss$/,
          loader: 'null-loader'
        },
        {
          test: /\.(jpe?g|png|gif|svg|ttf|eot|woff2?)(\?.*)?$/,
          loader: 'myapp-file-loader',
          query: {
            queryname: 1,
            name: '[path][name].[ext]'
          }
        }
      ]
    },
    plugins: pluginsObj
  }

  return config;
}
