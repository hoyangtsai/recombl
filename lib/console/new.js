'use strict';

const pathFn = require('path');
const Promise = require('bluebird');
const generateTpl = require('../helper/generateTpl');

module.exports = function() {
  let userConfig = require(pathFn.join(this.baseDir, 'userConfig.js'));
  let pageConfig = require(pathFn.join(this.baseDir, userConfig.pageConfig));
  let baseConfig = Object.assign({}, userConfig, pageConfig);

  let baseDir = this.baseDir;
  let log = this.log;

  if (Array.isArray(baseConfig.entry)) {
    this.config.entry.map((page) => {
      return outputFile(baseDir, baseConfig, page).catch(function(err) {
        log.error(err);
        return err;
      });
    });
  } else if (baseConfig.entry.constructor === Object) {
    Object.keys(baseConfig.entry).map(key => {
      baseConfig.entry[key].map(page => {
        return outputFile(baseDir, baseConfig, page).catch(function(err) {
          log.error(err);
          return err;
        });
      })
    })
  }
}

function outputFile(dir, config, page) {
  let htmlPath = pathFn.join('html', config.path, pathFn.dirname(page));
  let relRoot = pathFn.relative(htmlPath, config.path) + '/';

  return new Promise((resolve, reject) => {
    return generateTpl(
      pathFn.join(dir, config.htmlPath, config.path),
      page + '.html', pathFn.join(__dirname, '../../tpl/html.tpl'),
      [
        {
          match: /{__htmlTitle__}|{__cssName__}|{__jsName__}/g,
          replace: page
        },
        { match: /{__jsLayer__}/g, replace: '../' + relRoot },
        { match: /{__path__}/g, replace: config.path },
        { match: /{__devDir__}/g, replace: process.env.DEV_DIR },
        { match: /{__cssLayer__}/g, replace: relRoot }
      ]
    ).then(() => {
      return generateTpl(
        pathFn.join(dir, config.jsPath, config.path),
        page + '.js', pathFn.join(__dirname, '../../tpl/js.tpl'),
        [
          { match: /{__path__}/g, replace: config.path },
          { match: /{__scssName__}/g, replace: page }
        ]
      )
    }).then(() => {
      return generateTpl(
        pathFn.join(dir, config.cssPath, config.path),
        page + '.scss'
      );
    }).catch((err) => {
      reject(err);
    }).finally(() => {
      resolve();
    })
  });
}
