const path = require('path');
const getEntry = require('../getEntry');
const fs = require('fs');

module.exports = function(baseConfig) {
  let entryObj = getEntry(baseConfig);

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

  let config = {
    entry: entryObj,
    output: {
      path: path.join(process.env.PWD, process.env.DEV_DIR, baseConfig.path),
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
          test: /\.s?css$/,
          loader: 'style-loader!css-loader!sass-loader'
        }
      ]
    },
    devtool: 'eval'
  };

  if (baseConfig.postcss) {
    config['module']['loaders'][1]['loader'] = 'style-loader!css-loader!postcss-loader!sass-loader';

    config['postcss'] = [
      require("autoprefixer")(
        { browsers:["last 4 versions", "Android >= 4.0", "Chrome >= 37", "iOS>=7"] }),
      require("postcss-flexbugs-fixes"),
      require("postcss-gradientfixer")
    ];
  }

  return config;
}
