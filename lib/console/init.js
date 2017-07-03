const path = require('path');
const fs = require('fs');
const inquirer = require('inquirer');
const mkdirp = require('mkdirp');
const replaceStream = require('replacestream');
const generateTpl = require('../generateTpl.js');
const argv = require('optimist').argv;
const spawn = require('../../util/spawn');
const assign = require('object-assign');
const chalk = require('chalk');
const tildify = require('tildify');
const Promise = require('bluebird');
const commandExistsSync = require('command-exists').sync;

function initConsole(args) {
  args = assign({
    install: true,
  }, args);

  let baseDir = this.base_dir;
  let target = args._[0] ? path.resolve(baseDir, args._[0]) : baseDir;

  let log = this.log;
  let projectName, userName;
  let questions = [];

  if (baseDir === target) {
    questions.push({
      type: 'input',
      name: 'projectName',
      message: 'Project name?',
      validate: function (val) {
        if (!val) return 'Please enter a project name';
        return true;
      }
    });
  }

  questions.push({
    type: 'input',
    name: 'userName',
    message: 'User name? (RTX name)',
    validate: function (val) {
      if (!val) return 'Please enter a user name';
      return true;
    }
  });

  return new Promise((resolve, reject) => {
    inquirer.prompt(questions).then((ans) => {
      if (ans.projectName) {
        target = path.resolve(baseDir, ans.projectName);
      }

      if (fs.existsSync(target) && fs.readdirSync(target).length !== 0) {
        reject(new Error('target not empty'));
      }

      projectName = path.basename(target);
      userName = ans.userName;

      resolve();
    })
  }).then(() => {
    let dirArr = [
      path.join(target, 'client/container'),
      path.join(target, 'client/html'),
      path.join(target, 'client/image'),
      path.join(target, 'client/slice'),
      path.join(target, 'client/style'),
      path.join(target, 'config')
    ];

    for (let i in dirArr) {
      mkdirp.sync(dirArr[i]);
    }

    let packageJson = require('../../tpl/package.json');
    packageJson['name'] = projectName;
    packageJson['author'] = userName;

    copyConfig(target, projectName, userName, false);

    fs.writeFileSync(
      path.join(target, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    generateTpl(target,
      { htmlPath: 'client/html',
        jsPath: 'client/container',
        cssPath: 'client/style', path: ''},
      'index'
    );
  }).then(function() {
    if (!args.install) return;

    log.info('Install dependencies');

    let npmCommand = commandExistsSync('yarn') ? 'yarn' : 'npm';

    return spawn(npmCommand, ['install'], {
      cwd: target,
      stdio: 'inherit'
    });
  }).then(function() {
    log.info('Start developing pages with reco!');
  }).catch((err) => {
    if (err.message === 'target not empty') {
      log.fatal((chalk.magenta(tildify(target)) + ' exists!'));
    } else {
      log.warn('Failed to install dependencies. Please run \'npm install\' manually!');
    }
  });
}

function copyConfig(target, projectName, userName, postcss) {
  fs.createReadStream(path.resolve(__dirname, '../../tpl/config/userConfig.js'))
    .pipe(replaceStream(/\{__currentDir__\}/g, 'process.cwd()'))
    .pipe(replaceStream(/\{__projectName__\}/g, projectName))
    .pipe(replaceStream(/\{__userName__\}/g, userName))
    .pipe(replaceStream(/\{__postcss__\}/g, postcss))
    .pipe(fs.createWriteStream(path.join(target, 'userConfig.js')));

  fs.createReadStream(path.resolve(__dirname, '../../tpl/config/pageConfig.js'))
    .pipe(fs.createWriteStream(path.join(target, 'config/pageConfig.js')));
}

module.exports = initConsole;
