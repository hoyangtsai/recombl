const fs = require('fs');
const utilFs = require('../../util/fs');
const spawn = require('hexo-util/lib/spawn');
// const spawn = require('child_process').spawn;
const pathFn = require('path');
const Promise = require('bluebird');
const chalk = require('chalk');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');

module.exports = function(args) {
  process.env.NODE_ENV = 'production';

  let log = this.log;

  let userConfig = require(pathFn.join(process.env.PWD, 'userConfig.js'));
  let pageConfig = require(pathFn.join(process.env.PWD, userConfig.pageConfig));
  let baseConfig = Object.assign({}, userConfig, pageConfig);

  let webpackBaseConfig = require('../webpack/webpack.config.base');

  let webpackHtmlConfig = require('../webpack/webpack.config.html');
  let ssrConfig = webpackMerge(
    webpackBaseConfig(baseConfig, args), webpackHtmlConfig(baseConfig)
  );

  return webpackPromise(ssrConfig).then(stats => {
    if (Array.isArray(baseConfig.entry)) {
      return Promise.map(baseConfig.entry, page => {
        reactDOMRender(baseConfig, page);
      })
    } else {
      return Promise.map(Object.keys(baseConfig.entry), key => {
        return Promise.map(baseConfig.entry[key], page => {
          reactDOMRender(baseConfig, page);
        })
      })
    }
  })
  .then(() => {
    if (Array.isArray(baseConfig.entry)) {
      let webpackConfig = require('../webpack/webpack.config');
      let buildConfig = webpackMerge(
        webpackBaseConfig(baseConfig, args), webpackConfig(baseConfig)
      );
      return webpackPromise(buildConfig);
    } else {
      let webpackCssConfig = require('../webpack/webpack.config.css');
      let cssConfig = webpackMerge(
        webpackBaseConfig(baseConfig, args), webpackCssConfig(baseConfig)
      );
      let webpackJsConfig = require('../webpack/webpack.config.js.js');
      let jsConfig = webpackMerge(
        webpackBaseConfig(baseConfig, args), webpackJsConfig(baseConfig)
      );
      return webpackPromise(cssConfig).then(stats => {
        return webpackPromise(jsConfig);
      })
    }
  })
  .then(() => {
    let dirname = /(.*?)\/node_modules\/.*/.exec(__dirname.replace(/\\/g, '/')) === null ?
      __dirname : /(.*?)\/node_modules\/.*/.exec(__dirname.replace(/\\/g, '/'))[1];

    let binGulp = dirname === process.env.PWD.replace(/\\/g, '/') ?
      pathFn.join(process.env.PWD, 'node_modules/.bin/gulp') :
      pathFn.join(process.env.MODULE_PATH, '.bin/gulp');
    let gulpFile = pathFn.resolve(__dirname, '../../gulpfile.js');

    return spawn(`"${binGulp}"`, [
      `--gulpfile "${gulpFile}"`, `publish`, process.argv.slice(3) ],
      { shell: true, stdio: 'inherit', env: process.env }
    )
  })
  .catch(err => {
    log.error(err);
  })
}

function webpackPromise(config) {
  return new Promise((resolve, reject) => {
    webpack(config, (err, stats) => {
      if (err) reject(new Error('Build failed'));
      resolve(stats);
    })
  })
}

function reactDOMRender(config, fileName) {
  global.React = require('react');
  global.ReactDOM = require('react-dom');
  global.ReactDOMServer = require('react-dom/server');

  global.document = {
    querySelector: function(x) { return x; },
    getElementById: function(x) { return '#' + x; },
    getElementsByTagName: function() { return [] }
  };

  ReactDOM.render = (dom, place) => {
    let reg;
    if (place.indexOf(".") >= 0) {
      let str = place.slice((place.indexOf(".") + 1));
      reg = new RegExp("<.+class=.+" + str + "[^<]+>", "i");
    } else if (place.indexOf("#") >= 0) {
      let str = place.slice((place.indexOf("#") + 1));
      reg = new RegExp("<.+id=.+" + str + "[^<]+>", "i");
    }

    let htmlPath = pathFn.join(process.env.PWD,
      config.htmlPath, config.path, `${fileName}.html`);
    let html = ReactDOMServer.renderToStaticMarkup(dom);

    let content = String(fs.readFileSync(htmlPath))
      .replace(reg, match => { return match + html })
    let distHtmlPath = pathFn.join(process.env.PWD,
      process.env.DEV_DIR, 'ssr', config.path, `${fileName}.jade`);

    fs.writeFileSync(distHtmlPath, content);
  }

  try {
    let page = pathFn.join(process.env.PWD,
      process.env.DEV_DIR, 'ssr', config.path, `${fileName}.js`);
    require(page);
  } catch (err) {
    throw err;
  }
}
