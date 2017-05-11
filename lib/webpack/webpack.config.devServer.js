const path = require('path');
const getEntry = require('../getEntry');
const babelSettings = { extends: path.join(process.env.ROOT, '.babelrc') };

process.traceDeprecation = true

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
      rules:[
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          loader: 'babel-loader' + `?${JSON.stringify(babelSettings)}`
        },
        {
          test: /\.s?css$/,
          use: [
            'style-loader',
            'css-loader',
            'sass-loader'
          ]
        }
      ]
    },
    devtool: 'eval'
  };

  if (baseConfig.postcss) {
    config['module']['rules'][1]['use'] = [
      'style-loader',
      { loader: 'css-loader', options: { importLoaders: 1 }},
      { loader: 'postcss-loader', options: {
        plugins: (loader) => [
          require('autoprefixer')(
            { browsers:['last 4 versions', 'Android >= 4.0', 'Chrome >= 37', 'iOS>=7'] }),
          require('postcss-flexbugs-fixes'),
          require('postcss-gradientfixer')
        ]}
      },
      'sass-loader'
    ]
  }

  return config;
}
