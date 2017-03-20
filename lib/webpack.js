const webpack = require('webpack');
const path = require('path');
const argv = require('optimist').argv;

const config = require(path.resolve(__dirname, './webpack.init')).webpackConfig;

const compiler = webpack(config);

compiler.run(function(err, stats) {
  if (err) {
    console.log(err);
  }
});

// if watch
// compiler.watch({ // watch options:
//   aggregateTimeout: 300, // wait so long for more changes
//   poll: true // use polling instead of native watchers
//   // pass a number to set the polling interval
// }, function(err, stats) {
//   if (err) {
//     // throw new gutil.PluginError('webpack:build', err);
//   }
//   console.log(stats);
//   // console.log('[webpack:build]', stats.toString({
//   //   chunks: false,
//   //   colors: true
//   // }));
// });
