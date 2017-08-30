const Promise = require('bluebird');
const fs = require('fs');
const pathFn = require('path');
const tildify = require('tildify');

const gulp = require('gulp');
const replace = require('gulp-replace');
const prettify = require('gulp-jsbeautifier');
const replaceStream = require('replacestream');

module.exports = function(args) {
  let log = this.log;
  let baseDir = this.baseDir;

  let userConfig = require(pathFn.join(baseDir, 'userConfig.js'));
  let pageConfig = require(pathFn.join(baseDir, userConfig.pageConfig));
  let baseConfig = Object.assign({}, userConfig, pageConfig);

  return Promise.try(function() {
    let listHtml = pathFn.join(baseDir, baseConfig.htmlPath, baseConfig.path, 'list.html');

    if (fs.existsSync(listHtml)) {
      let strList = String(fs.readFileSync(listHtml));
      if (strList.indexOf('<html data="generatefile"') < 0) {
        log.warn(`${tildify(listHtml)} 已存在 且为非自动生成文件 不能覆盖`);
        return;
      }
    }

    let fileList = baseConfig.entry;
    let titleList = [];
    if (!Array.isArray(fileList)) {
      fileList = [];
      Object.keys(baseConfig.entry).map(key => {
        baseConfig.entry[key].map(page => {
          fileList.push(page);
        })
      })
    }

    for (let j in fileList) {
      let jsFile = pathFn.join(baseDir, baseConfig.jsPath, baseConfig.path, fileList[j] + '.js');

      if (fs.existsSync(jsFile)) {
        let strJs = String(fs.readFileSync(jsFile));
        let title = strJs.match(/<Helmet[^>]+>/);
        if (!title) {
          title = ['无题-'+fileList[j]];
        } else {
          title = title[0].toLowerCase().split('title');
          if (title.length < 2) {
            title = '无题-'+fileList[j];
          } else {
            title = title[1];
            let oneNumber = title.indexOf("'"), twoNumber = title.indexOf('"');
            let str = '';
            if (oneNumber == -1) {
              str = '"';
            } else if (twoNumber == -1) {
              str = "'";
            } else {
              if (oneNumber < twoNumber) {
                str = "'";
              } else {
                str = '"';
              }
            }
            title = title.split(str);
            if (title.length < 3) {
              title = '无题-'+fileList[j];
            } else {
              title = title[1].trim();
            }
          }
          if (!title) {
            title = '无题-'+fileList[j];
          }
        }
        title += '&TITLE&HREF&' + fileList[j];
        titleList.push(title);
      }
    }

    let categoryTitle = {};
    for (let k in titleList) {
      let titleHref = titleList[k];
      titleHref = titleHref.split('&TITLE&HREF&');
      let title = titleHref[0],
      href = titleHref[1];
      title = title.split('--');
      let category = '__NOCATEFORY';
      if (title.length > 1) {
        category = title[1].trim();
      }
      title = title[0].trim();
      if (!categoryTitle[category]) {
        categoryTitle[category] = [];
      }
      categoryTitle[category].push([title, href]);
    }

    let content = '';
    if (!!categoryTitle['__NOCATEFORY']) {
      let noCatefory = categoryTitle['__NOCATEFORY'];
      for (let m in noCatefory) {
        content += '<li><a href="'+noCatefory[m][1]+'.html">'+noCatefory[m][0]+'</a></li>';
      }
    }

    for (let key in categoryTitle) {
      if (key == '__NOCATEFORY') continue;

      let titleHrefList = categoryTitle[key];
      content += '<li><h3>'+key+'</h3><ul>'
      for (n in titleHrefList) {
        content += '<li><a href="'+titleHrefList[n][1]+'.html">'+titleHrefList[n][0]+'</a></li>'
      }
      content += '</ul></li>'
    }

    gulp.src(pathFn.resolve(__dirname, '../../resources/list.html'))
      .pipe(replace(/{__content__}/g, content))
      .pipe(prettify())
      .pipe(gulp.dest(pathFn.join(baseDir, baseConfig.htmlPath, baseConfig.path)));

    log.info(`成功生成 ${tildify(listHtml)}`);
  })
  .catch(function(err) {
    throw err;
  })

}