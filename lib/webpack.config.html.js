const path = require('path');
const getEntry = require('./getEntry');

module.exports = function(baseConfig) {
  let entryObj = getEntry(baseConfig);

  return {
    entry: entryObj,
    output: {
      path: path.join(process.cwd(), '/dist/', baseConfig.path),
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
          loader: 'css!sass'
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
    }
  }
}
