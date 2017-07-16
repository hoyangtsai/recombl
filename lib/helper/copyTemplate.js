const fs = require('fs');
const pathFn = require('path');
const chalk = require('chalk');
const mkdirp = require('mkdirp');
const tildify = require('tildify');
const Promise = require('bluebird');

module.exports = function(dest, fileName, templPath, replaceq) {
  let fullPath = pathFn.join(dest, fileName);
  let log = this.log;
  return Promise.try(function() {
    try {
      if (fs.existsSync(fullPath)) {
        log.info(chalk.yellow(`${tildify(fullPath)} 已存在`));
      } else {
        let template = templPath ? String(fs.readFileSync(templPath)) : '';
        if (replaceq && Array.isArray(replaceq)) {
          replaceq.map(query => {
            template = template.replace(query.match, query.replace);
          })
        }

        mkdirp.sync(pathFn.dirname(fullPath));
        fs.writeFileSync(fullPath, template);
        log.info(chalk.green(`${tildify(fullPath)} 成功生成`));
      }
    } catch (err) {
      throw err;
    }
  })
}
