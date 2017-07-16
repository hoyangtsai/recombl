const fs = require('fs');
const del = require('del');
const spawn = require('hexo-util/lib/spawn');
// const spawn = require('child_process').spawn;
const pathFn = require('path');
const Promise = require('bluebird');
const chalk = require('chalk');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');

const beautifyHtml = require('js-beautify').html;

let webpackBaseConfig = require('../webpack/webpack.config.base');

process.env.NODE_ENV = 'production';

module.exports = function(args) {
  let log = this.log;
  let baseDir = this.baseDir;

  let userConfig = require(pathFn.join(this.baseDir, 'userConfig.js'));
  let pageConfig = require(pathFn.join(this.baseDir, userConfig.pageConfig));
  let baseConfig = Object.assign({}, userConfig, pageConfig);

  let webpackHtmlConfig = require('../webpack/webpack.config.html');
  let webpackOutputHtmlConfig = webpackMerge(
    webpackBaseConfig(baseConfig), webpackHtmlConfig(baseConfig)
  );

  return webpackPromise(webpackOutputHtmlConfig).then(() => {
    return spawn('node',
      [ pathFn.resolve(__dirname, '../helper/reactDomRender.js') ],
      { env: process.env }
    )
    // .on('error', (spawnError) =>
    //     console.error(chalk.bold.red(`Generate html error: ${spawnError}`))
    //   )
    // htmlSpawn.stderr.on('data', function (data) {
    //   console.error('outHtmlChild stderr: ' + data);
    // })
    // htmlSpawn.stdout.on('data', function (data) {
    //   console.info('outHtmlChild stdout: ' + data);
    // })
  }).catch(err => {
    log.error(err);
  }).then(() => {
    if (Array.isArray(baseConfig.entry)) {
      baseConfig.entry.map((page) => {
        beautifyHtml(fs.readFileSync(pathFn.join(process.env.PWD,
          process.env.DEV_DIR, baseConfig.path, `${page}.jade`))
        )
      })
    }

  })
}

function webpackPromise(config) {
  return new Promise((resolve, reject) => {
    webpack(config, (err, stats) => {
      if (err) reject(err);
      resolve();
    })
  })
}
