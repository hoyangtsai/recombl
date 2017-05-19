const path = require('path');
const getEntry = require('../getEntry');
const babelSettings = { extends: path.join(__dirname, '../../.babelrc') };

module.exports = function(baseConfig) {
  return {
    entry: getEntry(baseConfig),
    output: {
      path: path.join(process.cwd(), process.env.DEV_DIR, baseConfig.path),
      publicPath: '.',
      filename: '[name].js'
    },
    module: {
      rules:[
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          loader: `babel-loader?${JSON.stringify(babelSettings)}`
        },
        {
          test: /\.s?css$/,
          use: ['css-loader', 'sass-loader']
        },
        {
          test: /\.(jpe?g|png|gif|svg|ttf|eot|woff2?)(\?.*)?$/,
          loader: 'file-loader',
          options: {
            context: path.join(process.cwd(), 'client', baseConfig.path),
            name: '[path][name].[ext]'
          }
        }
      ]
    }
  }
}
