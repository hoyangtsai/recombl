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

let userConfig = require(pathFn.join(process.env.PWD, 'userConfig.js'));
let pageConfig = require(pathFn.join(process.env.PWD, userConfig.pageConfig));
let baseConfig = Object.assign({}, userConfig, pageConfig);

let webpackBaseConfig = require('../webpack/webpack.config.base');

process.env.NODE_ENV = 'production';

module.exports = function(args) {
  let log = this.log;

  let webpackHtmlConfig = require('../webpack/webpack.config.html');
  let webpackOutputHtmlConfig = webpackMerge(
    webpackBaseConfig(baseConfig), webpackHtmlConfig(baseConfig)
  );

  return webpackPromise(webpackOutputHtmlConfig).then(() => {
    if (Array.isArray(baseConfig.entry)) {
      baseConfig.entry.map((page) => {
        reactDOMRender(page)
      })
    }
  }).catch(err => {
    log.error(err);
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

function reactDOMRender(fileName) {
  global.React = require('react');
  global.ReactDOM = require('react-dom');
  global.ReactDOMServer = require('react-dom/server');

  if (typeof window === 'undefined') {
    global.window = {};
  }

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
      baseConfig.htmlPath, baseConfig.path, `${fileName}.html`);

    let html = ReactDOMServer.renderToStaticMarkup(dom);
    let fileHtml = String(fs.readFileSync(htmlPath))
      .replace(reg, match => { return match + html });

    let distHtmlPath = pathFn.join(process.env.PWD,
      process.env.DEV_DIR, baseConfig.path, `${fileName}.jade`);

    fs.writeFileSync(distHtmlPath, beautifyHtml(fileHtml));
  }
  try {
    let page = pathFn.join(process.env.PWD,
      process.env.DEV_DIR, baseConfig.path, `${fileName}.js`);
    require(page);
  } catch (err) {
    throw err;
  }
}
