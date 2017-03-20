// require('babel-register');

// import express from 'express';
// import serveIndex from 'serve-index';
// import webpack from 'webpack';
// import webpackDevMiddleware from 'webpack-dev-middleware';
// import webpackHotMiddleware from 'webpack-hot-middleware';

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const path = require('path');
const argv = require('optimist').argv;
const config = require(path.resolve(__dirname, './webpack.init')).webpackConfig;
const PORT = argv.port || argv.p || 6001;

// console.log(config);

const compiler = webpack(config);

const server = new WebpackDevServer(compiler, {
  publicPath: config.output.path,
  hot: true,
  stats: {
    colors: true
  }
});

server.listen(PORT, 'localhost', () => {
  console.log(`Listening at http://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    process.exit(0);
  });
});



// if (DEV) {
//   const app = express();

//   app.use(express.static(process.cwd()));
//   app.use(serveIndex(process.cwd()));

//   const wdm = webpackDevMiddleware(compiler, {
//     publicPath: config.output.path,
//     stats: {
//       colors: true
//     }
//   });
//   app.use(wdm);

//   app.use(webpackHotMiddleware(compiler));

//   app.listen(PORT, 'localhost', serverError => {
//     if (serverError) {
//       return console.error(serverError);
//     }
//     console.log(`Listening at http://localhost:${PORT}`);
//   });
// } else {
//   compiler.watch({ // watch options:
//     aggregateTimeout: 300, // wait so long for more changes
//     poll: true // use polling instead of native watchers
//     // pass a number to set the polling interval
//   }, function(err, stats) {
//     if (err) {
//       // throw new gutil.PluginError('webpack:build', err);
//     }
//     console.log('[webpack:build]', stats.toString({
//       chunks: false, // Makes the build much quieter
//       colors: true
//     }));
//   });
// }
