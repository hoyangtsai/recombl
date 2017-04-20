const argv = require('optimist').argv;
const path = require('path');
const webpack = require('webpack');
const OpenBrowserPlugin = require('open-browser-webpack-plugin');
const getEntry = require('../getEntry');

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
          exclude: /node_modules|_tmp/,
          loaders: ['react-hot', 'babel?presets[]=es2015,presets[]=stage-0,presets[]=react,presets[]=react-hmre']
        },
        {
          test: /\.scss$/,
          loader: 'style!css!sass'
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
    plugins: [
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin()
    ],
    devtool: 'eval'
  };

  if (baseConfig.postcss) {
    config['module']['loaders'][1]['loader'] = 'style!css!postcss!sass';
    config['postcss'] = [
      require("autoprefixer")(
        { browsers:["last 4 versions", "Android >= 4.0", "Chrome >= 37", "iOS>=7"] }),
      require("postcss-flexbugs-fixes"),
      require("postcss-gradientfixer")
    ];
  }

  if (argv.open) {
    config.plugins.push(new OpenBrowserPlugin({ url: `http://localhost:${process.env.SERVER_PORT}/${baseConfig.htmlPath}` }));
  }

  return config;
}
