module.exports = function(baseConfig) {
  let config = {
    output: {
      filename: '[name].js',
    },

    externals: {
      'react': 'React',
      'react-dom': 'ReactDOM'
    },

    resolve: {
      extensions: ['', '.js', '.jsx'],
      alias: baseConfig.alias,
      fallback: process.env.MODULE_PATH
    },

    resolveLoader: {
      modulesDirectories: ['node_modules', process.env.MODULE_PATH]
    }
  };

  if (process.env.NODE_ENV === 'development') {
    const webpack = require('webpack');

    config['plugins'] = [
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin()
    ];
  }

  return config;
}
