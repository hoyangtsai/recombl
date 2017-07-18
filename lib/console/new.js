const pathFn = require('path');
const Promise = require('bluebird');
const copyTemplate = require('../helper/copyTemplate');

module.exports = function() {
  let log = this.log;
  let baseDir = this.baseDir;

  let userConfig = require(pathFn.join(baseDir, 'userConfig.js'));
  let pageConfig = require(pathFn.join(baseDir, userConfig.pageConfig));
  let baseConfig = Object.assign({}, userConfig, pageConfig);

  if (Array.isArray(baseConfig.entry)) {
    baseConfig.entry.map((page) => {
      return outputFile.call(this, baseConfig, page).catch(function(err) {
        log.error(err);
      });
    });
  } else if (baseConfig.entry.constructor === Object) {
    Object.keys(baseConfig.entry).map(key => {
      baseConfig.entry[key].map(page => {
        return outputFile.call(this, baseConfig, page).catch(function(err) {
          log.error(err);
        });
      })
    })
  }
}

function outputFile(config, page) {
  let htmlPath = pathFn.join('html', config.path, pathFn.dirname(page));
  let relRoot = pathFn.relative(htmlPath, config.path) + '/';

  return new Promise((resolve, reject) => {
    return copyTemplate.call(this,
      pathFn.join(this.baseDir, config.htmlPath, config.path),
      page + '.html', pathFn.join(__dirname, '../../resources/template.html'),
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
      return copyTemplate.call(this,
        pathFn.join(this.baseDir, config.jsPath, config.path),
        page + '.js', pathFn.join(__dirname, '../../resources/template.js'),
        [
          { match: /{__path__}/g, replace: config.path },
          { match: /{__scssName__}/g, replace: page }
        ]
      )
    }).then(() => {
      return copyTemplate.call(this,
        pathFn.join(this.baseDir, config.cssPath, config.path),
        page + '.scss'
      );
    }).catch((err) => {
      reject(err);
    }).finally(() => {
      resolve();
    })
  });
}
