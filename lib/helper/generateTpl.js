'use strict';

const fs = require('fs');
const pathFn = require('path');
const chalk = require('chalk');
const mkdirp = require('mkdirp');
const tildify = require('tildify');
const Promise = require('bluebird');

module.exports = function(dest, fileName, templPath, replaceq) {
  let fullPath = pathFn.join(dest, fileName);

  return new Promise(function(resolve, reject) {
    try {
      if (fs.existsSync(fullPath)) {
        console.log(chalk.bold.yellow(`${tildify(fullPath)} 已存在`));
      } else {
        let template = templPath ? String(fs.readFileSync(templPath)) : '';
        if (replaceq && Array.isArray(replaceq)) {
          replaceq.map(query => {
            template = template.replace(query.match, query.replace);
          })
        }

        mkdirp.sync(pathFn.dirname(fullPath));
        fs.writeFileSync(fullPath, template);
        console.log(chalk.bold.green(`${tildify(fullPath)} 成功生成`));
      }
      resolve();
    } catch (err) {
      reject(err);
      throw new Error(err);
    }
  });
}
