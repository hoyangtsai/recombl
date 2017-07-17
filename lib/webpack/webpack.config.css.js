const path = require('path');
const fs = require('fs');
const UglifyJsPlugin = require('webpack/optimize/UglifyJsPlugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const extractCSS = new ExtractTextPlugin('[name].css');
const argv = require('optimist').argv;

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

  let plugins = [extractCSS];

  let commonsChunk = getCommonsChunk(baseConfig);
  if (commonsChunk) {
    plugins.push(commonsChunk);
  }

  if (argv.compress || argv.min) {
    plugins.push(new UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }));
  }

  let config = {
    entry: entryObj,
    module: {
      loaders:[
        {
          test: /\.s?css$/,
          loader: extractCSS.extract(['css-loader', 'sass-loader'])
        }
      ]
    },
    plugins: plugins
  };

  if (baseConfig.postcss) {
    config['module']['loaders'][1]['loader'] =
      extractCSS.extract(['css-loader', 'postcss-loader', 'sass-loader']);

    config['postcss'] = [
      require("autoprefixer")(
        { browsers:["last 4 versions", "Android >= 4.0", "Chrome >= 37", "iOS>=7"] }),
      require("postcss-flexbugs-fixes"),
      require("postcss-gradientfixer")
    ];
  }

  return config;
}
