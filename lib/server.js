const argv = require('optimist').argv;
const PORT = argv.port || argv.p || 6001;
process.env.SERVER_PORT = PORT;

const fs = require('fs');
const path = require('path');
const userConfig = require(path.join(process.cwd(), 'userConfig.js'));
const pageConfig = require(path.join(process.cwd(), userConfig.pageConfig));
const baseConfig = Object.assign(userConfig, pageConfig);

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

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const compiler = webpack(webpackConfig);

const server = new WebpackDevServer(compiler, {
  contentBase: process.cwd(),
  publicPath: path.join(`/${process.env.DEV_DIR}/`, baseConfig.path, '/'),
  inline: true,
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
