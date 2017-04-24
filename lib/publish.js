const fs = require('fs');
const del = require('del');
const spawn = require('child_process').spawn;
const webpack = require('webpack');
const chalk = require('chalk');
const red = chalk.bold.red;
const yellow = chalk.bold.yellow;
const green = chalk.bold.green;
const path = require('path');
const Promise = require('bluebird');

const userConfig = require(path.join(process.cwd(), 'userConfig.js'));
const pageConfig = require(path.join(process.cwd(), userConfig.pageConfig));
const baseConfig = Object.assign(userConfig, pageConfig);

const webpackBaseConfig = require('./webpack/webpack.config.base');
const webpackHtmlConfig = require('./webpack/webpack.config.html');
const webpackCssConfig = require('./webpack/webpack.config.css');
const webpackJsConfig = require('./webpack/webpack.config.js');
const webpackConfig = require('./webpack/webpack.config');

const webpackOutputHtmlConfig = Object.assign(webpackBaseConfig(baseConfig), webpackHtmlConfig(baseConfig));
const webpackOutputCssConfig = Object.assign(webpackBaseConfig(baseConfig), webpackCssConfig(baseConfig));
const webpackOutputJsConfig = Object.assign(webpackBaseConfig(baseConfig), webpackJsConfig(baseConfig));
const webpackOutputConfig = Object.assign(webpackBaseConfig(baseConfig), webpackConfig(baseConfig));

const hasRouter = checkRouter();
if (hasRouter) {
  if (generateRouterTempFile()) {
    for (let key in webpackOutputHtmlConfig.entry) {
      webpackOutputHtmlConfig.entry[key] += 'x';
    }
  } else {
    console.error(red('error generateRouterTempFile: 生成临时jsx文件出错'));
    return;
  }
}

function spawnPromise(command, args, options, stdout, stderr) {
  return new Promise(function(resolve, reject) {
    let process = spawn(command, args, options || {});
    process.stdout.on('data', data => { if (stdout) stdout(data) });
    process.stderr.on('data', data => { if (stderr) stderr(data) });

    process.on('close', code => {
      if (code === 0) {
        resolve(code);
      } else {
        reject({command: command, args: args, code: code});
      }
    })
  })
}

function webpackPromise(config) {
  return new Promise((resolve, reject) => {
    webpack(config, (err, stats) => {
      if (err) reject(err);
      resolve(stats);
    })
  })
}

console.info('begin build');
console.info(yellow('begin out HTML dist JS tempfile'));
console.time('end   out HTML dist JS tempfile');
webpackPromise(webpackOutputHtmlConfig)
  .then(stats => {
    return 'end   out HTML dist JS tempfile';
  })
  .then((htmlEnd) => {
    console.timeEnd(htmlEnd);
    console.info(yellow('begin out HTML tempfile'));
    spawnPromise('node', [ path.join(__dirname, './generateHtml.js') ], { env: process.env })
      .then(code => {
        if (code === 0) {
          if (hasRouter) {
            console.info('begin clear routerTempFile');
            clearRouterTempFile();
            console.info('end   clear routerTempFile');
          }
        }
      })
      .error(error => {
        console.error(red(`Generate html error: ${error}`))
      })
  })
  .then((htmlEnd) => {
    console.info('end   out HTML tempfile');
    // if (!Array.isArray(baseConfig.entry)) {
    //   console.info(yellow('begin Out CSS'));
    //   console.time('end   Out CSS');
    //   webpackPromise(webpackOutputCssConfig)
    //     .then(stats => {
    //       return 'end   Out CSS'
    //     })
    //     .then(CssEnd => {
    //       console.timeEnd(CssEnd);
    //       console.info(yellow('begin Out JS'));
    //       console.time('end   Out JS');
    //       webpackPromise(webpackOutputConfig)
    //         .then(stats => {
    //           return 'end   Out JS';
    //         })
    //         .then(JsEnd => {
    //           console.timeEnd(JsEnd);
    //           console.info('begin To Publish');
    //           console.info('begin Clear Tempfile');
    //           let binGulp = path.join(process.env.MODULE_PATH, '.bin/gulp');
    //           let gulpFile = path.resolve(__dirname, '../gulpfile.js');
    //           spawn(binGulp, [ `--gulpfile ${gulpFile}`, `publish` ],
    //             { shell: true, stdio: 'inherit', env: process.env })
    //             .on('close', code => process.exit(code))
    //             .on('error', spawnError => console.error(`gulp error: ${spawnError}`))
    //         })
    //         .error(err => {
    //           console.error(red(`outputJsWebpack err: ${err}`));
    //         })
    //     })
    //     .error(err => {
    //       console.error(red(`outputCssWebpack err: ${err}`));
    //     })
    // }
    // else {
    //   console.info(yellow('begin Out JS'));
    //   console.time('end   Out JS');
    //   webpackPromise(webpackOutputConfig)
    //     .then(stats => {
    //       return 'end   Out JS';
    //     })
    //     .then(JsEnd => {
    //       console.timeEnd(JsEnd);
    //       console.info('begin To Publish');
    //       console.info('begin Clear Tempfile');
    //       let binGulp = path.join(process.env.MODULE_PATH, '.bin/gulp');
    //       let gulpFile = path.resolve(__dirname, '../gulpfile.js');
    //       spawn(binGulp, [ `--gulpfile ${gulpFile}`, `publish` ],
    //         { shell: true, stdio: 'inherit', env: process.env })
    //         .on('close', code => process.exit(code))
    //         .on('error', spawnError => console.error(`gulp error: ${spawnError}`))
    //     })
    //     .error(err => {
    //       console.error(red(`outputJsWebpack err: ${err}`));
    //     })
    // }
  })
  .error(err => {
    console.error(red(`outputHtmlWebpack err: ${err}`));
  })

function checkRouter() {
  let hasRouter = false;
  if (Array.isArray(baseConfig.entry)) {
    for (let i in baseConfig.entry) {
      let fileName = baseConfig.entry[i];
      let strFile = String(fs.readFileSync(baseConfig.jsPath + baseConfig.path + `/${fileName}.js`));
      if (strFile.indexOf('react-router') > -1) {
        hasRouter = true;
        break;
      }
    }
  }
  return hasRouter;
}

function generateRouterTempFile() {
  let result = true;
  for (let i in baseConfig.entry) {
    let fileName = baseConfig.entry[i];
    try {
      let exists = fs.existsSync(baseConfig.jsPath + baseConfig.path + `/${fileName}.jsx`);
      if (exists) {
        let strJsx = String(fs.readFileSync(baseConfig.jsPath + baseConfig.path + `/${fileName}.jsx`));

        if (strJsx.indexOf('/** generated temporary file **/') < 0) {
          console.error('error generateRouterTempFile: ' + baseConfig.jsPath + baseConfig.path + `/${fileName}.jsx 为非系统生成临时文件 请重命名`);
          result = false;
          break;
        }
      }
      var strFile = String(fs.readFileSync(baseConfig.jsPath + baseConfig.path + `/${fileName}.js`));
      strFile = strFile.replace(/import.+['"]react-router['"]/, '');
      strFile = strFile.replace(/<Router[\s\S]+<\/Router>/, function(str) {
        str = str.replace(/<Router[^<]*>/, '<div>');
        str = str.replace('</Router>', '</div>');
        str = str.replace(/<IndexRedirect[^<]*>/g, '');
        str = str.replace(/<Redirect[^<]*>/g, '');
        str = str.replace(/<IndexRoute[^<]*>/g, function(match) {
          match = match.replace(/[\s\S]+component\s*=\s*\{/i, '');
          match = match.replace(/\}[\s\S]+/, '');
          return '<' + match + '/>';
        });
        str = str.replace(/<Route[^<]*>/g, function(match) {
          match = match.replace(/[\s\S]+component\s*=\s*\{/i, '');
          match = match.replace(/\}[\s\S]+/, '');
          return '<' + match + '/>';
        });
        return str;
      });
      strFile = '/** generated temporary file **/\r\n' + strFile;
      fs.writeFileSync(baseConfig.jsPath + baseConfig.path + `/${fileName}.jsx`, strFile);
    } catch (e) {
      result = false;
      console.error('error generateRouterTempFile:' + e);
    }
  }
  return result;
}

function clearRouterTempFile() {
  let delFileList = [];
  for (let i in baseConfig.entry) {
    let fileName = baseConfig.entry[i];
    delFileList.push(baseConfig.jsPath + baseConfig.path + `/${fileName}.jsx`);
  }
  del.sync(delFileList);
}
