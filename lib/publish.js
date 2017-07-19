const fs = require('fs');
const del = require('del');
const spawn = require('child_process').spawn;
const webpack = require('webpack');
const path = require('path');
const colors = require('colors');
const Promise = require('bluebird');
const chalk = require('chalk');

const userConfig = require(path.join(process.cwd(), 'userConfig.js'));
const pageConfig = require(path.join(process.cwd(), userConfig.pageConfig));
const baseConfig = Object.assign({}, userConfig, pageConfig);

const dirname = /(.*?)\/node_modules\/.*/.exec(__dirname.replace(/\\/g, '/')) === null ?
  __dirname : /(.*?)\/node_modules\/.*/.exec(__dirname.replace(/\\/g, '/'))[1];

const webpackMerge = require('webpack-merge');
const webpackBaseConfig = require('./webpack/webpack.config.base');
const webpackHtmlConfig = require('./webpack/webpack.config.html');

let webpackOutputHtmlConfig = webpackMerge(
  webpackBaseConfig(baseConfig), webpackHtmlConfig(baseConfig)
);
if (Array.isArray(baseConfig.extLoaders)) {
  for (let i in baseConfig.extLoaders) {
    webpackOutputHtmlConfig.module.loaders.push(baseConfig.extLoaders[i]);
  }
}

const hasRouter = checkRouter();
if (hasRouter) {
  if (generateRouterTempFile()) {
    for (let key in webpackOutputHtmlConfig.entry) {
      webpackOutputHtmlConfig.entry[key] += 'x';
    }
  } else {
    console.error(chalk.red.bold('error generateRouterTempFile: 生成临时jsx文件出错'));
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

console.time(chalk.yellow('begin out HTML tempfile'));
console.time('end   out HTML tempfile');
webpackPromise(webpackOutputHtmlConfig)
  .then(stats => {
    const htmlSpawn = spawn('node', [ path.join(__dirname, './generateHtml.js') ], { env: process.env })
      .on('close', code => {
        if (code === 0) {
          if (hasRouter) {
            console.info('begin clear routerTempFile');
            clearRouterTempFile();
            console.info('end   clear routerTempFile');
          }

          console.timeEnd('end   out HTML tempfile');
          console.info(chalk.yellow('begin out HTML tempfile'));
          console.info('end   out HTML tempfile');
          if (!Array.isArray(baseConfig.entry)) {
            const webpackCssConfig = require('./webpack/webpack.config.css');
            let webpackOutputCssConfig = webpackMerge(
                webpackBaseConfig(baseConfig), webpackCssConfig(baseConfig)
            );
            if (Array.isArray(baseConfig.extLoaders)) {
              for (let i in baseConfig.extLoaders) {
                webpackOutputCssConfig.module.loaders.push(baseConfig.extLoaders[i]);
              }
            }

            const webpackJSConfig = require('./webpack/webpack.config.js.js');
            let webpackOutputJsConfig = webpackMerge(
                webpackBaseConfig(baseConfig), webpackJSConfig(baseConfig)
            );
            if (Array.isArray(baseConfig.extLoaders)) {
              for (let i in baseConfig.extLoaders) {
                webpackOutputJsConfig.module.loaders.push(baseConfig.extLoaders[i]);
              }
            }

            console.info(chalk.yellow('begin Out CSS'));
            console.time('end   Out CSS');
            webpackPromise(webpackOutputCssConfig)
              .then((stats) => {
                return 'end   Out CSS'
              })
              .then((CssEnd) => {
                console.timeEnd(CssEnd);
                console.info(chalk.yellow('begin Out JS'));
                console.time('end   Out JS');
                webpackPromise(webpackOutputJsConfig)
                  .then(stats => {
                    return 'end   Out JS';
                  })
                  .then(JsEnd => {
                    console.timeEnd(JsEnd);
                    console.info('begin To Publish');
                    console.info('begin Clear Tempfile');
                    let binGulp = dirname === process.env.PWD.replace(/\\/g, '/') ?
                      path.join(process.env.PWD, 'node_modules/.bin/gulp') :
                      path.join(process.env.MODULE_PATH, '.bin/gulp');
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
            const webpackConfig = require('./webpack/webpack.config');
            let webpackOutputConfig = webpackMerge(
              webpackBaseConfig(baseConfig), webpackConfig(baseConfig)
            );
            if (Array.isArray(baseConfig.extLoaders)) {
              for (let i in baseConfig.extLoaders) {
                webpackOutputConfig.module.loaders.push(baseConfig.extLoaders[i]);
              }
            }

            console.info('begin Out JS'.yellow);
            console.time('end   Out JS');
            webpackPromise(webpackOutputConfig)
              .then(stats => {
                console.timeEnd('end   Out JS');
                console.info('begin To Publish');
                console.info('begin Clear Tempfile');
                let binGulp = dirname === process.env.PWD.replace(/\\/g, '/') ?
                  path.join(process.env.PWD, 'node_modules/.bin/gulp') :
                  path.join(process.env.MODULE_PATH, '.bin/gulp');
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
        }
      })
      .on('error', (spawnError) =>
        console.error(chalk.bold.red(`Generate html error: ${spawnError}`))
      )
    htmlSpawn.stderr.on('data', function (data) {
      console.error('outHtmlChild stderr: ' + data);
    })
    htmlSpawn.stdout.on('data', function (data) {
      console.info('outHtmlChild stdout: ' + data);
    })
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
