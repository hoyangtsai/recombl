const fs = require('fs');
const del = require('del');
const spawn = require('child_process').spawn;
const webpack = require('webpack');
const path = require('path');
const colors = require('colors');
const Promise = require('bluebird');

const userConfig = require(path.join(process.cwd(), 'userConfig.js'));
const pageConfig = require(path.join(process.cwd(), userConfig.pageConfig));
const baseConfig = Object.assign(userConfig, pageConfig);

const webpackMerge = require('webpack-merge');
const webpackBaseConfig = require('./webpack/webpack.config.base');
const webpackHtmlConfig = require('./webpack/webpack.config.html');
const webpackCssConfig = require('./webpack/webpack.config.css');
const webpackConfig = require('./webpack/webpack.config');

let webpackOutputHtmlConfig = webpackMerge(webpackBaseConfig(baseConfig), webpackHtmlConfig(baseConfig));
if (Array.isArray(baseConfig.extLoaders)) {
  for (let i in baseConfig.extLoaders) {
    webpackOutputHtmlConfig.module.loaders.push(baseConfig.extLoaders[i]);
  }
}
let webpackOutputConfig = webpackMerge(webpackBaseConfig(baseConfig), webpackConfig(baseConfig));
if (Array.isArray(baseConfig.extLoaders)) {
  for (let i in baseConfig.extLoaders) {
    webpackOutputConfig.module.loaders.push(baseConfig.extLoaders[i]);
  }
}

const hasRouter = checkRouter();
if (hasRouter) {
  if (generateRouterTempFile()) {
    for (let key in webpackOutputHtmlConfig.entry) {
      webpackOutputHtmlConfig.entry[key] += 'x';
    }
  } else {
    console.error('error generateRouterTempFile: 生成临时jsx文件出错'.bold.red);
    return;
  }
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
console.info('begin out HTML dist JS tempfile'.yellow);
console.time('end   out HTML dist JS tempfile');
webpackPromise(webpackOutputHtmlConfig)
  .then(stats => {
    return 'end   out HTML dist JS tempfile';
  })
  .then((htmlEnd) => {
    console.timeEnd(htmlEnd);
    console.info('begin out HTML tempfile'.yellow);

    spawn('node', [ path.join(__dirname, './generateHtml.js') ], { env: process.env })
      .on('close', code => {
        if (code === 0) {
          if (hasRouter) {
            console.info('begin clear routerTempFile');
            clearRouterTempFile();
            console.info('end   clear routerTempFile');
          }
        }
      })
      .on('error', spawnError => console.error(`Generate html error: ${spawnError}`.bold.red))
  })
  .then((htmlEnd) => {
    console.info('end   out HTML tempfile');
    if (!Array.isArray(baseConfig.entry)) {
      let webpackOutputCssConfig = webpackMerge(
          webpackBaseConfig(baseConfig), webpackCssConfig(baseConfig));
      if (Array.isArray(baseConfig.extLoaders)) {
        for (let i in baseConfig.extLoaders) {
          webpackOutputCssConfig.module.loaders.push(baseConfig.extLoaders[i]);
        }
      }
      console.info('begin Out CSS'.yellow);
      console.time('end   Out CSS');
      webpackPromise(webpackOutputCssConfig)
        .then(stats => {
          return 'end   Out CSS'
        })
        .then(CssEnd => {
          console.timeEnd(CssEnd);
          console.info('begin Out JS'.yellow);
          console.time('end   Out JS');
          webpackPromise(webpackOutputConfig)
            .then(stats => {
              return 'end   Out JS';
            })
            .then(JsEnd => {
              console.timeEnd(JsEnd);
              console.info('begin To Publish');
              console.info('begin Clear Tempfile');
              let binGulp = path.join(process.env.MODULE_PATH, '.bin/gulp');
              let gulpFile = path.resolve(__dirname, '../gulpfile.js');
              spawn(`"${binGulp}"`, [
                `--gulpfile "${gulpFile}"`, `publish`, process.argv.slice(2).join(' ') ],
                { shell: true, stdio: 'inherit', env: process.env })
                .on('close', code => process.exit(code))
                .on('error', spawnError => console.error(`gulp error: ${spawnError}`))
            })
            .error(err => {
              console.error(`outputJsWebpack err: ${err}`.bold.red);
            })
        })
        .error(err => {
          console.error(`outputCssWebpack err: ${err}`.bold.red);
        })
    }
    else {
      console.info('begin Out JS'.yellow);
      console.time('end   Out JS');
      webpackPromise(webpackOutputConfig)
        .then(stats => {
          return 'end   Out JS';
        })
        .then(JsEnd => {
          console.timeEnd(JsEnd);
          console.info('begin To Publish');
          console.info('begin Clear Tempfile');
          let binGulp = path.join(process.env.MODULE_PATH, '.bin/gulp');
          let gulpFile = path.resolve(__dirname, '../gulpfile.js');
          spawn(`"${binGulp}"`, [
            `--gulpfile "${gulpFile}"`, `publish`, process.argv.slice(2).join(' ') ],
            { shell: true, stdio: 'inherit', env: process.env })
            .on('close', code => process.exit(code))
            .on('error', spawnError => console.error(`gulp error: ${spawnError}`))
        })
        .error(err => {
          console.error(`outputJsWebpack err: ${err}`.bold.red);
        })
    }
  })
  .error(err => {
    console.error(`outputHtmlWebpack err: ${err}`.bold.red);
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
