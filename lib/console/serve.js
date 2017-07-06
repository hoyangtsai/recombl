
const assign = require('object-assign');
const fs = require('fs');
const path = require('path');
const webpackMerge = require('webpack-merge');

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const chalk = require('chalk');
const ifaces = require('os').networkInterfaces();
const ProgressPlugin = require('webpack/lib/ProgressPlugin');

const userConfig = require(path.join(process.cwd(), 'userConfig.js'));
const pageConfig = require(path.join(process.cwd(), userConfig.pageConfig));
const baseConfig = assign(userConfig, pageConfig);

const webpackBaseConfig = require('../webpack/webpack.config.base');
const webpackDevServerConfig = require('../webpack/webpack.config.devServer');

function webpackServer(args) {
  let port = args.port ||
    (typeof args.p === 'number' ? args.p : false) || 6001;

  process.env.SERVER_PORT = port;

  args = assign({
    port: port,
    open: false
  }, args);

  let webpackConfig = webpackMerge(webpackBaseConfig(baseConfig), webpackDevServerConfig(baseConfig));
  if (Array.isArray(baseConfig.extLoaders)) {
    for (let i in baseConfig.extLoaders) {
      webpackConfig.module.loaders.push(baseConfig.extLoaders[i]);
    }
  }

  let fullDevDir = path.join(process.cwd(), process.env.DEV_DIR);
  let reactFile = path.join(fullDevDir, 'react.js');

  if (!fs.existsSync(fullDevDir)) {
    fs.mkdirSync(fullDevDir);
    fs.writeFileSync(reactFile, fs.readFileSync(path.join(__dirname, 'react/react_dev.js')));
  } else if (!fs.existsSync(reactFile)) {
    fs.writeFileSync(reactFile, fs.readFileSync(path.join(__dirname, 'react/react_dev.js')));
  }

  let log = this.log;
  let startup = false;
  let completeLog;

  let compiler = webpack(webpackConfig);

  compiler.apply(new ProgressPlugin(function (percentage, msg, current, active, modulepath) {
    clearTimeout(completeLog);
    if (process.stdout.isTTY && percentage < 1) {
      process.stdout.cursorTo(0)
      modulepath = modulepath ? ' …' + modulepath.substr(modulepath.length - 30) : ''
      current = current ? ' ' + current : ''
      active = active ? ' ' + active : ''
      process.stdout.write((percentage * 100).toFixed(0) + '% '
        + msg + current + active + modulepath + ' ')
      process.stdout.clearLine(1)
    } else if (percentage === 1) {
      process.stdout.write('\n')
      log.info('webpack: done.')
      completeLog = setTimeout(() => {
        console.info([chalk.yellow('Starting up webpack-dev-server\n'),
          chalk.yellow('Server listening at:')
        ].join(''));

        Object.keys(ifaces).forEach(dev => {
          ifaces[dev].forEach(details => {
            if (details.family === 'IPv4') {
              console.info(`  http://${details.address}:` + chalk.green(`${args.port}`));
            }
          });
        });
        console.info(`  http://localhost:` + chalk.green(`${args.port}`));

        if ( (args.o | args.open) && !startup ) {
          require('open')(`http://localhost:${args.port}/${baseConfig.htmlPath}`);
        }
        startup = true;
      }, 1000)
    }
  }))

  const server = new WebpackDevServer(compiler, {
    contentBase: process.env.PWD.replace(/\\/g, '/'),
    publicPath: path.join(`/${process.env.DEV_DIR}/`, baseConfig.path, '/').replace(/\\/g, '/'),
    inline: true,
    hot: true,
    stats: {
      colors: true
    }
  });

  server.listen(args.port, 'localhost', (err) => {
    if (err) log.fatal(chalk.bold.red(err));
  });
}

module.exports = webpackServer;
