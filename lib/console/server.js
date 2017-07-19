const utilFs = require('../../util/fs');
const path = require('path');
const Promise = require('bluebird');
const format = require('util').format;
const open = require('opn');
const net = require('net');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const WebpackDevServer = require('webpack-dev-server');
const chalk = require('chalk');
const ifaces = require('os').networkInterfaces();
const ProgressBarPlugin = require('progress-bar-webpack-plugin');

module.exports = function(args) {
  let ip = process.env.HOST || args.h || args.host || '0.0.0.0';
  let port = parseInt(args.port || args.p) || 8003;

  process.env.NODE_ENV = 'development';
  process.env.SERVER_PORT = port;

  let self = this;
  let log = this.log;

  let userConfig = require(path.join(this.baseDir, 'userConfig.js'));
  let pageConfig = require(path.join(this.baseDir, userConfig.pageConfig));
  let baseConfig = Object.assign({}, userConfig, pageConfig);

  return checkPort(ip, port).then(function() {
    return utilFs.copyFileSync(
      path.join(__dirname, '../react/react_dev.js'),
      path.join(self.baseDir, process.env.DEV_DIR, 'react.js'),
    );
  }).then(function() {
    let webpackBaseConfig = require('../webpack/webpack.config.base');
    let webpackDevServerConfig = require('../webpack/webpack.config.devServer');
    let serverConfig = webpackMerge(
      webpackBaseConfig(baseConfig), webpackDevServerConfig(baseConfig));

    serverConfig.plugins.push(
      new ProgressBarPlugin({
        format: 'build [:bar] ' + chalk.green.bold(':percent') +
          ' (:elapsed seconds) ' + chalk.gray(':msg'),
        renderThrottle: 100,
        clear: false,
        callback: () => {
          log.info(chalk.yellow(
            'Webpack server is running. Press Ctrl+C to stop.'));
          log.info(chalk.yellow('Server listening at:'));

          Object.keys(ifaces).map(key => {
            ifaces[key].map(details => {
              if (details.family === 'IPv4') {
                log.info(`http://${details.address}:` + chalk.green(`${port}`));
              }
            });
          });
        }
      })
    )
    let compiler = webpack(serverConfig);
    return compiler;
  }).then(function(compiler) {
    let publicPath = path.join(
      `/${process.env.DEV_DIR}/`, baseConfig.path, '/').replace(/\\/g, '/');
    return startServer(compiler, publicPath, ip, port);
  }).then(function(server) {
    let addr = formatAddress(ip, port, baseConfig.htmlPath);
    if (args.o || args.open) {
      open(addr);
    }
    return server;
  }).catch(function(err) {
    switch (err.code) {
      case 'EADDRINUSE':
        log.fatal('Port %d has been used. Try another port instead.', port);
        break;
    }
    throw err;
  })
}

function startServer(compiler, publicPath, ip, port) {
  return new Promise(function(resolve, reject) {
    let server = new WebpackDevServer(compiler, {
      contentBase: process.env.PWD.replace(/\\/g, '/'),
      publicPath: publicPath,
      hot: true,
      noInfo: true,
      stats: {
        colors: true
      },
      headers: { "Access-Control-Allow-Origin": "*" }
    });

    server.listen(port, ip, function(error) {
      if (error) {
        reject(error);
      }
      resolve(server);
    });
  });
}

function checkPort(ip, port) {
  return new Promise(function(resolve, reject) {
    if (port > 65535 || port < 1) {
      return reject(new Error(
        `Port number ${port} is invalid.
        Try a port number between 1 and 65535.`));
    }

    let server = net.createServer();
    server.listen(port, ip);

    server.once('error', reject);

    server.once('listening', function() {
      server.close();
      resolve();
    });
  });
}

function formatAddress(ip, port, root) {
  if (ip === '0.0.0.0') ip = 'localhost';

  return format('http://%s:%d/%s', ip, port, root);
}
