const path = require('path');
const Promise = require('bluebird');
const generateTpl = require('../helper/generateTpl');

module.exports = function() {
  let userConfig = require(path.join(this.baseDir, 'userConfig.js'));
  let pageConfig = require(path.join(this.baseDir, userConfig.pageConfig));
  // let baseConfig = Object.assign({}, userConfig, pageConfig);
  this.config = Object.assign({}, userConfig, pageConfig);

  let log = this.log;

  if (Array.isArray(this.config.entry)) {
    this.config.entry.map((page) => {
      return outputFile.call(this, page).catch(function(err) {
        log.error(err);
        return err;
      });
    });
  } else if (this.config.entry.constructor === Object) {
    Object.keys(this.config.entry).map(key => {
      this.config.entry[key].map(page => {
        return outputFile.call(this, page).catch(function(err) {
          log.error(err);
          return err;
        });
      })
    })
  }
}

function outputFile(page) {
  let baseDir = this.baseDir;
  let config = this.config;

  let htmlPath = path.join('html', config.path, path.dirname(page));
  let relRoot = path.relative(htmlPath, config.path) + '/';

  return new Promise(function(resolve, reject) {
    return generateTpl(
      path.join(baseDir, config.htmlPath, config.path),
      page + '.html', path.join(__dirname, '../../tpl/html.tpl'),
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
    ).then(function() {
      return generateTpl(
        path.join(baseDir, config.jsPath, config.path),
        page + '.js', path.join(__dirname, '../../tpl/js.tpl'),
        [
          { match: /{__path__}/g, replace: config.path },
          { match: /{__scssName__}/g, replace: page }
        ]
      )
    }).then(function() {
      generateTpl(
        path.join(baseDir, config.cssPath, config.path),
        page + '.scss'
      );
    }).catch(function(err) {
      reject(err);
    }).finally(function() {
      resolve();
    })
  });
}
