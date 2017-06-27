const argv = require('optimist').argv;
const PORT = argv.port || argv.p || 6001;
process.env.SERVER_PORT = PORT;

const fs = require('fs');
const path = require('path');
const userConfig = require(path.join(process.cwd(), 'userConfig.js'));
const pageConfig = require(path.join(process.cwd(), userConfig.pageConfig));
const baseConfig = Object.assign({}, userConfig, pageConfig);

const webpackMerge = require('webpack-merge');
const webpackBaseConfig = require('./webpack/webpack.config.base');
const webpackDevServerConfig = require('./webpack/webpack.config.devServer');

let webpackConfig = webpackMerge(webpackBaseConfig(baseConfig), webpackDevServerConfig(baseConfig));
if (Array.isArray(baseConfig.extLoaders)) {
  for (let i in baseConfig.extLoaders) {
    webpackConfig.module.loaders.push(baseConfig.extLoaders[i]);
  }
}

const fullDevDir = path.join(process.cwd(), process.env.DEV_DIR);
const reactFile = path.join(fullDevDir, 'react.js');
if (!fs.existsSync(fullDevDir)) {
  fs.mkdirSync(fullDevDir);
  fs.writeFileSync(reactFile, fs.readFileSync(path.join(__dirname, 'react/react_dev.js')));
} else if (!fs.existsSync(reactFile)) {
  fs.writeFileSync(reactFile, fs.readFileSync(path.join(__dirname, 'react/react_dev.js')));
}

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const colors = require('colors');
const ifaces = require('os').networkInterfaces();
const ProgressPlugin = require('webpack/lib/ProgressPlugin');

const compiler = webpack(webpackConfig);

let completeLog;
compiler.apply(new ProgressPlugin(function (percentage, msg, current, active, modulepath) {
  clearTimeout(completeLog);
  if (process.stdout.isTTY && percentage < 1) {
    process.stdout.cursorTo(0)
    modulepath = modulepath ? ' …' + modulepath.substr(modulepath.length - 30) : ''
    current = current ? ' ' + current : ''
    active = active ? ' ' + active : ''
    process.stdout.write((percentage * 100).toFixed(0) + '% ' + msg + current + active + modulepath + ' ')
    process.stdout.clearLine(1)
  } else if (percentage === 1) {
    process.stdout.write('\n')
    console.log('webpack: done.')
    completeLog = setTimeout(() => {
      console.info(['Starting up webpack-dev-server'.yellow,
        '\nServer listening at:'.yellow
      ].join(''));

      Object.keys(ifaces).forEach(dev => {
        ifaces[dev].forEach(details => {
          if (details.family === 'IPv4') {
            console.info(`  http://${details.address}:${PORT}`.green);
          }
        });
      });
      console.info(`  http://localhost:${PORT}`.green);

      if (argv.o | argv.open) {
        require('open')(`http://localhost:${PORT}/${baseConfig.htmlPath}`);
      }
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

server.listen(PORT, 'localhost', (err) => {
  if (err) {
    console.error(err.bold.red);
    process.exit();
  }
});

process.on('SIGTERM', () => {
  server.close(() => {
    process.exit();
  });
});
