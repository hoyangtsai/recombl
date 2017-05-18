const path = require('path');
const getEntry = require('../getEntry');
const babelSettings = { extends: path.join(__dirname, '../../.babelrc') };

module.exports = function(baseConfig) {
  let entryObj = getEntry(baseConfig);
  let config = {
    entry: entryObj,
    output: {
      path: path.join(process.cwd(), process.env.DEV_DIR, baseConfig.path),
      publicPath: `http://localhost:${process.env.SERVER_PORT}/${process.env.DEV_DIR}/`,
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
          test: /\.css$/,
          loader: 'style-loader!css-loader'
        },
        {
          test: /\.scss$/,
          loader: 'style-loader!css-loader!sass-loader'
        }
      ]
    },
    devtool: 'eval'
  };

  if (baseConfig.postcss) {
    config['module']['loaders'][1]['loader'] = 'style-loader!css-loader!postcss-loader';
    config['module']['loaders'][2]['loader'] = 'style-loader!css-loader!postcss-loader!sass-loader';
    config['postcss'] = [
      require("autoprefixer")(
        { browsers:["last 4 versions", "Android >= 4.0", "Chrome >= 37", "iOS>=7"] }),
      require("postcss-flexbugs-fixes"),
      require("postcss-gradientfixer")
    ];
  }

  return config;
}
