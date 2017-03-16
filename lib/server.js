require('babel-register');

import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

const path = require('path');
const argv = require('minimist')(process.argv.slice(2));
const config = require(path.resolve(__dirname, './webpack.init')).webpackConfig;
const PORT = argv.port || argv.p || 6001;
const DEV = argv['watch'] || argv['w'] || argv['dev'] || argv['_'].includes('dev');

const compiler = webpack(config);

console.log(config);

if (DEV) {
  const app = express();

  const wdm = webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath,
    stats: {
      colors: true
    }
  });

  app.use(wdm);

  app.use(webpackHotMiddleware(compiler));

  const server = app.listen(PORT, 'localhost', serverError => {
    if (serverError) {
      return console.error(serverError);
    }
    console.log(`Listening at http://localhost:${PORT}`);
  });
} else {
  compiler.watch({ // watch options:
    aggregateTimeout: 300, // wait so long for more changes
    poll: true // use polling instead of native watchers
    // pass a number to set the polling interval
  }, function(err, stats) {
    if (err) {
      // throw new gutil.PluginError('webpack:build', err);
    }
    console.log('[webpack:build]', stats.toString({
      chunks: false, // Makes the build much quieter
      colors: true
    }));
  });
}
