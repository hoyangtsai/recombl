'use strict';

const path = require('path');
const fs = require('fs');
const inquirer = require('inquirer');
const mkdirp = require('mkdirp');
const replaceStream = require('replacestream');
const generateTpl = require('../generateTpl.js');
const spawn = require('../../util/spawn');
const assign = require('object-assign');
const chalk = require('chalk');
const tildify = require('tildify');
const Promise = require('bluebird');
const commandExistsSync = require('command-exists').sync;

function initConsole(args) {
  args = assign({
    install: true
  }, args);

  let log = this.log;
  this.target = args._[0] ? path.join(this.baseDir, args._[0]) : this.baseDir;

  askQuestion.call(this, args._[0], args.u).then(result => {
    let dirArr = [
      path.join(this.target, 'client/container'),
      path.join(this.target, 'client/html'),
      path.join(this.target, 'client/image'),
      path.join(this.target, 'client/slice'),
      path.join(this.target, 'client/style'),
      path.join(this.target, 'config')
    ];

    dirArr.map(dir => {
      mkdirp.sync(dir);
    });

    let packageJson = require('../../tpl/package.json');
    packageJson['name'] = result.project;
    packageJson['author'] = result.user;

    copyConfig(this.target, result.project, result.user, false);

    fs.writeFileSync(
      path.join(this.target, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    generateTpl(this.target,
      { htmlPath: 'client/html',
        jsPath: 'client/container',
        cssPath: 'client/style', path: ''},
      'index'
    );
  }).then(() => {
    if (!args.install) return;

    log.info('Install dependencies');

    let npmCommand = commandExistsSync('yarn') ? 'yarn' : 'npm';

    return spawn(npmCommand, ['install'], {
      cwd: this.target,
      stdio: 'inherit'
    });
  }).then(result => {
    log.info('Project init with reco completely!');
  }).catch((err) => {
    if (err.message === 'target not empty') {
      log.fatal((chalk.magenta(tildify(this.target)) + ' exists!'));
    } else {
      log.error(err.message);
    }
    throw err;
  });
}

function askQuestion(projectName, userName) {
  return new Promise((resolve, reject) => {
    if (projectName && fs.existsSync(this.target)) {
      reject(new Error('target not empty'));
    } else if (projectName && userName) {
      resolve({
        project: projectName,
        user: userName
      });
    } else {
      let questions = [];

      if (!projectName) {
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

      inquirer.prompt(questions).then((ans) => {
        if (ans.projectName) {
          this.target = path.resolve(this.baseDir, ans.projectName);
        }
        if (fs.existsSync(this.target)) {
          reject(new Error('target not empty'));
        }

        projectName = path.basename(this.target);
        userName = ans.userName;

        resolve({
          project: projectName,
          user: userName
        });
      })
    }
  })
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
