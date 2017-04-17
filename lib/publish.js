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

const userConfig = require(path.join(process.cwd(), 'userConfig'));
const pageConfig = require(path.join(process.cwd(), userConfig.pageConfig));
const baseConfig = Object.assign(userConfig, pageConfig);

const webpackBaseConfig = require('./webpack.config.base');
const webpackHtmlConfig = require('./webpack.config.html');
const webpackCssConfig = require('./webpack.config.css');
const webpackConfig = require('./webpack.config');

const webpackOutputHtmlConfig = Object.assign(webpackBaseConfig(baseConfig), webpackHtmlConfig(baseConfig));
const webpackOutputCssConfig = Object.assign(webpackBaseConfig(baseConfig), webpackCssConfig(baseConfig));

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
  });
}


// webpack(webpackOutputCssConfig, function(err, stats) {
//   err && console.error('webpack err: ', err);
// });

console.info('begin build');
console.info('begin out HTML dist JS tempfile');
console.time('end   out HTML dist JS tempfile');
webpack(webpackOutputHtmlConfig, function(err, stats) {
  err && console.error('outHtmlWebpack err: ', err);
  console.timeEnd('end   out HTML dist JS tempfile');
  console.info(yellow('begin out HTML tempfile'));

  spawnPromise('node', [ path.join(__dirname, './generateHtml.js') ])
    .then(code => {
      if (code === 0) {
        console.info(yellow('end   out HTML tempfile'));
        if (hasRouter) {
          console.info(yellow('begin clear routerTempFile'));
          clearRouterTempFile();
          console.info(yellow('end   clear routerTempFile'));
        }

  //       if (!Array.isArray(baseConfig.entry)) {
  //         spawnPromise('node', [ path.join(__dirname, './generateSinglePage.js') ])
  //           .then(code => {
  //             if (code === 0) {
  //               console.info('end   Out CSS Tempfile');
  //               console.info('begin Out CSS');
  //               console.time('end   Out CSS');
  //               webpack(webpackOutputCssConfig, function(err, stats) {
  //                 err && console.error('webpack err: ', err);
  //                 console.timeEnd('end   Out CSS');
  //                 console.info('begin Out JS');
  //                 console.time('end   Out JS');

  //                 // webpack(outJsWebpackConfig, function(err, stats) {
  //                 //   err && console.error('webpack err: ', err);
  //                 //   console.timeEnd('end   Out JS');
  //                 //   console.info('begin To Publish');
  //                 //   console.info('begin Clear Tempfile');
  //                 // });
  //               });
  //             }
  //           });
  // //       } else {
  // //       }
  //       }
      }
    })
});

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
