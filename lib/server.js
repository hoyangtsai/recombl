const argv = require('optimist').argv;
const PORT = argv.port || argv.p || 6001;
process.env.SERVER_PORT = PORT;

const fs = require('fs');
const path = require('path');
const userConfig = require(path.join(process.cwd(), 'userConfig.js'));
const pageConfig = require(path.join(process.cwd(), userConfig.pageConfig));
const baseConfig = Object.assign(userConfig, pageConfig);

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const webpackBaseConfig = require('./webpack/webpack.config.base');
const webpackDevServerConfig = require('./webpack/webpack.config.devServer');
const webpackConfig = Object.assign(webpackBaseConfig(baseConfig), webpackDevServerConfig(baseConfig));


const fullDevDir = path.join(process.cwd(), process.env.DEV_DIR);
const reactFile = path.join(fullDevDir, 'react.js');
if (!fs.existsSync(fullDevDir)) {
  fs.mkdirSync(fullDevDir);
  fs.writeFileSync(reactFile, fs.readFileSync(path.join(__dirname, 'react/react_dev.js')));
} else if (!fs.existsSync(reactFile)) {
  fs.writeFileSync(reactFile, fs.readFileSync(path.join(__dirname, 'react/react_dev.js')));
}

const colors = require('colors');
const ifaces = require('os').networkInterfaces();

let compiler = webpack(webpackConfig, (err, stats) => {
  if (err) {
    console.error(err.bold.red);
    process.exit();
  }

  let server = new WebpackDevServer(compiler, {
    contentBase: process.cwd().replace(/\\/g, '/'),
    publicPath: path.join(`/${process.env.DEV_DIR}/`, baseConfig.path, '/').replace(/\\/g, '/'),
    inline: true,
    hot: true,
    stats: {
      colors: true
    }
  });

  server.listen(PORT, 'localhost', () => {
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
  });

  process.on('SIGTERM', () => {
    server.close(() => {
      process.exit();
    });
  });
});
