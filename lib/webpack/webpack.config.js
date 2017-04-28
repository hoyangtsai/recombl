const path = require('path');
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const extractCSS = new ExtractTextPlugin('[name].css');
const getEntry = require('../getEntry');
const babelSettings = { extends: path.join(__dirname, '../../.babelrc') };

module.exports = function(baseConfig) {
  let plugins = [];
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
    plugins.push(new CommonsChunkPlugin(chunkObj));
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
      loaders:[
        {
          test: /\.jsx?$/,
          exclude: new RegExp(`node_modules|${process.env.DEV_DIR}`),
          loader: `babel-loader?${JSON.stringify(babelSettings)}`
        },
        {
          test: /\.scss$/,
          loader: extractCSS.extract(['css','sass'])
        },
        {
          test: /\.(jpe?g|png|gif|ttf|eot|woff2?)(\?.*)?$/,
          loader: 'myapp-file-loader',
          query: {
            queryname: 1,
            name: '[path][name].[ext]'
          }
        },
        {
          test: /\.(svg)$/i,
          loader: 'svg-sprite-loader',
        }
      ]
    },
    plugins: plugins
  };

  if (baseConfig.postcss) {
    config['module']['loaders'][1]['loader'] = extractCSS.extract(['css','postcss','sass']);
    config['postcss'] = [
      require("autoprefixer")(
        { browsers:["last 4 versions", "Android >= 4.0", "Chrome >= 37", "iOS>=7"] }),
      require("postcss-flexbugs-fixes"),
      require("postcss-gradientfixer")
    ];
  }

  return config;
}
