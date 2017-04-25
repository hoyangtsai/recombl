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
      // root: process.env.MODULE_PATH,
      modulesDirectories: ['web_loaders', 'web_modules', 'node_loaders', process.env.MODULE_PATH]
    }
  };

  if (process.env.NODE_ENV === 'development') {
    const argv = require('optimist').argv;
    const webpack = require('webpack');
    const OpenBrowserPlugin = require('open-browser-webpack-plugin');

    config['plugins'] = [
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin()
    ];
    if (argv.open) {
      config['plugins'].push(new OpenBrowserPlugin({
        url: `http://localhost:${process.env.SERVER_PORT}/${baseConfig.htmlPath}` }
      ));
    }
  } else if (process.env.NODE_ENV === 'production') {
    const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
    const ExtractTextPlugin = require('extract-text-webpack-plugin');
    const extractCSS = new ExtractTextPlugin('[name].css');

    let plugins = [];
    if (baseConfig.entry && !!baseConfig.commonsChunk) {
      let comName = (baseConfig.commonsChunk && baseConfig.commonsChunk.name) || 'common';
      let chunkObj = {
        name: comName,
        filename: comName + '.js'
      };
      if (baseConfig.commonsChunk && baseConfig.commonsChunk.minChunks) {
        chunkObj.minChunks = baseConfig.commonsChunk.minChunks;
      }
      if (baseConfig.commonsChunk.excludeFile && baseConfig.commonsChunk.excludeFile.length > 0) {
        chunkObj.chunks = baseConfig.entry.slice();
        for (let j in baseConfig.commonsChunk.excludeFile) {
          removeArrayValue(chunkObj.chunks, baseConfig.commonsChunk.excludeFile[j]);
        }
      }
      plugins.push(new CommonsChunkPlugin(chunkObj));
    }
    plugins.push(extractCSS);

    config['stats'] = {
      // minimal logging
      assets: true,
      colors: true,
      version: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      children: false
    };

    config['plugins'] = plugins
  }

  return config;
}
