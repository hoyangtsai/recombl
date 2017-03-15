import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

const ENV = process.env.ENV || 'development';
const PORT = process.env.PORT || 6001;

const path = require('path');
const argv = require('minimist')(process.argv.slice(2));
const config = require(path.resolve(__dirname, './webpack.init')).webpackConfig;
// console.log(config);

const app = express();
const compiler = webpack(config);

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
