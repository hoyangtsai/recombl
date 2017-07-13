'use strict';

const pathFn = require('path');
const fs = require('fs');
const inquirer = require('inquirer');
const mkdirp = require('mkdirp');
const replaceStream = require('replacestream');
const generateTpl = require('../helper/generateTpl');
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
  let baseDir = this.baseDir;
  this.target = args._[0] ? pathFn.join(this.baseDir, args._[0]) : this.baseDir;

  return askReq.call(this, args._[0], args.u).then(feedback => {
    let dirArr = [
      pathFn.join(this.target, 'client/container'),
      pathFn.join(this.target, 'client/html'),
      pathFn.join(this.target, 'client/image'),
      pathFn.join(this.target, 'client/slice'),
      pathFn.join(this.target, 'client/style'),
      pathFn.join(this.target, 'config')
    ];

    dirArr.map(dir => {
      mkdirp.sync(dir);
    });

    copyConfig(this.target, feedback.project, feedback.user, false);

    let packageJson = require('../../tpl/package.json');
    packageJson['name'] = feedback.project;
    packageJson['author'] = feedback.user;

    fs.writeFileSync(
      pathFn.join(this.target, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
  }).catch((err) => {
    log.error((chalk.magenta(tildify(this.target)) + ' exists!'));
    return Promise.reject(err);
  }).then(() => {
    return generateTpl(
      pathFn.join(this.target, 'client/html'),
      'index.html', pathFn.join(__dirname, '../../tpl/html.tpl'),
      [
        {
          match: /{__htmlTitle__}|{__cssName__}|{__jsName__}/g,
          replace: 'index'
        },
        { match: /{__jsLayer__}/g, replace: '../../' },
        { match: /{__path__}/g, replace: '' },
        { match: /{__devDir__}/g, replace: process.env.DEV_DIR },
        { match: /{__cssLayer__}/g, replace: '../' }
      ]
    ).then(() => {
      return generateTpl(
        pathFn.join(this.target, 'client/container'),
        'index.js', pathFn.join(__dirname, '../../tpl/js.tpl'),
        [
          { match: /{__path__}/g, replace: '' },
          { match: /{__scssName__}/g, replace: 'index' }
        ]
      )
    }).then(() => {
      return generateTpl(
        pathFn.join(this.target, 'client/style'), 'index.scss'
      )
    })
  }).then(() => {
    if (!args.install) return;

    log.info('Install dependencies');

    let npmCommand = commandExistsSync('yarn') ? 'yarn' : 'npm';

    return spawn(npmCommand, ['install'], {
      cwd: this.target,
      stdio: 'inherit'
    });
  }).then(() => {
    log.info('Project init with reco completely!');
  }).catch(() => {
    log.warn('Failed to npm install dependencies.');
  });
}

function askReq(projectName, userName) {
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
          this.target = pathFn.resolve(this.baseDir, ans.projectName);
        }
        if (fs.existsSync(this.target)) {
          reject(new Error('target not empty'));
        }

        projectName = pathFn.basename(this.target);
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
  fs.createReadStream(pathFn.resolve(__dirname, '../../tpl/config/userConfig.js'))
    .pipe(replaceStream(/\{__currentDir__\}/g, 'process.cwd()'))
    .pipe(replaceStream(/\{__projectName__\}/g, projectName))
    .pipe(replaceStream(/\{__userName__\}/g, userName))
    .pipe(replaceStream(/\{__postcss__\}/g, postcss))
    .pipe(fs.createWriteStream(pathFn.join(target, 'userConfig.js')));

  fs.createReadStream(pathFn.resolve(__dirname, '../../tpl/config/pageConfig.js'))
    .pipe(fs.createWriteStream(pathFn.join(target, 'config/pageConfig.js')));
}

module.exports = initConsole;
