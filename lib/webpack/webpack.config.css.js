const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const extractCSS = new ExtractTextPlugin('[name].css');
const babelSettings = { extends: path.join(__dirname, '../../.babelrc') };

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
  let entryObj = {};
  if (Array.isArray(baseConfig.entry)) {
    return null;
  } else {
    for (let key in baseConfig.entry) {
      entryObj[key] = path.join(process.cwd(), baseConfig.jsPath, baseConfig.path, `/${key}.jsx`);
    }
  }

  let plugins = [];
  if (!!baseConfig.commonsChunk) {
    let chunkObj = {
      name: baseConfig.commonsChunk.name || 'common',
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
    entry: entryObj,
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
