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
      alias: baseConfig.alias
    },

    resolveLoader: {
      modulesDirectories: ['node_modules', process.env.MODULE_PATH]
    }
  };

  if (process.env.NODE_ENV === 'development') {
    const argv = require('optimist').argv;
    const webpack = require('webpack');

    config['plugins'] = [
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin()
    ];

    if (argv.o | argv.open) {
      const OpenBrowserPlugin = require('open-browser-webpack-plugin');

      config['plugins'].push(new OpenBrowserPlugin({
        url: `http://localhost:${process.env.SERVER_PORT}/${baseConfig.htmlPath}` }
      ));
    }
  }

  return config;
}
