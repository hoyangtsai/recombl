const argv = require('optimist').argv;
const webpack = require('webpack');
const path = require('path');
const getEntry = require('./getEntry');
const OpenBrowserPlugin = require('open-browser-webpack-plugin');

module.exports = function(baseConfig) {
  let entryObj = getEntry(baseConfig);
  let config = {
    entry: entryObj,
    output: {
      path: path.join(process.cwd(), '/dist/', baseConfig.path),
      publicPath: `http://localhost:${process.env.SERVER_PORT}/dist/`,
      filename: '[name].js'
    },

    module: {
      loaders:[
        {
          test: /\.jsx?$/,
          exclude: /node_modules|dist/,
          loaders: ['react-hot', 'babel?presets[]=react-hmre']
        },
        {
          test: /\.scss$/,
          loader: 'style!css!postcss!sass'
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
  if (baseConfig.postcss && Array.isArray(baseConfig.postcss)) {
    config['postcss'] = baseConfig.postcss
  }
  if (argv.open) {
    config.plugins.push(new OpenBrowserPlugin({ url: `http://localhost:${process.env.SERVER_PORT}` }));
  }
  return config;
}
