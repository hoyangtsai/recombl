const path = require('path');

module.exports = function(baseConfig) {
  let config = {
    context: process.env.ROOT,

    output: {
      filename: '[name].js',
    },

    externals: {
      'react': 'React',
      'react-dom': 'ReactDOM'
    },

    resolve: {
      extensions: [".js", ".json", ".jsx", ".css"],
      alias: baseConfig.alias,
      modules:[process.env.MODULE_PATH, path.join(process.env.PWD, 'node_modules')]
    }
  };

  if (process.env.NODE_ENV === 'development') {
    const webpack = require('webpack');

    config['plugins'] = [
      new webpack.optimize.OccurrenceOrderPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin()
    ];
  }

  return config;
}
