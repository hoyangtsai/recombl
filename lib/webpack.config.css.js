const path = require('path');
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const extractCSS = new ExtractTextPlugin('[name].css');

module.exports = function(baseConfig) {
  let entryObj = {};
  if (Array.isArray(baseConfig.entry)) {
    return null;
  } else {
    for (let key in baseConfig.entry) {
      let arr = [];
      for (let i in baseConfig.entry[key]) {
        let fileName = baseConfig.entry[key][i];
        let page = path.join(process.cwd(), baseConfig.jsPath, baseConfig.path, `${fileName}.js`);
        arr.push(page);
      }
      entryObj[key] = arr;
    }
  }

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
  pluginsObj.push(extractCSS);

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
          loader: extractCSS.extract(['css','sass'])
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
  };

  if (baseConfig.postcss && Array.isArray(baseConfig.postcss)) {
    config['postcss'] = baseConfig.postcss
    config['module']['loaders'][1]['loader'] = extractCSS.extract(['css','postcss','sass']);
  } else {
    config['module']['loaders'][1]['loader'] = extractCSS.extract(['css','sass']);
  }
  return config;
}
