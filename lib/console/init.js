const pathFn = require('path');
const Promise = require('bluebird');
const fs = require('fs');
const inquirer = require('inquirer');
const mkdirp = require('mkdirp');
const replaceStream = require('replacestream');
const copyTemplate = require('../helper/copyTemplate');
const spawn = require('../../util/spawn');
const chalk = require('chalk');
const tildify = require('tildify');
const os = require('os');

function initConsole(args) {
  args = Object.assign({
    install: true,
    eject: false
  }, args);

  let log = this.log;
  let baseDir = this.baseDir;

  let target = args._[0] ? pathFn.join(this.baseDir, args._[0]) : this.baseDir;
  let projectName = args._[0];
  let userName = args.u;
  let gitDir = pathFn.join(this.baseDir, '.git');

  return Promise.try(function() {
    if (projectName && fs.existsSync(target)) {
      log.error((chalk.magenta(tildify(target)) + ' exists!'));
      return Promise.reject(new Error('target not empty'));
    }

    if (projectName && userName) {
      return Promise.props({
        projectName: projectName,
        userName: userName
      });
    }

    let questions = [];

    if (!projectName) {
      let targetExcludeGit = fs.readdirSync(target);
      targetExcludeGit.splice(targetExcludeGit.indexOf('.git'));

      if (targetExcludeGit.length === 0 || fs.readdirSync(target).length === 0) {
        return Promise.props({
          userName: os.userInfo().username.toLowerCase()
        });
      }

      questions.push({
        type: 'input',
        name: 'projectName',
        message: 'Project name?',
        validate: function (val) {
          if (!val) return 'Please enter project name';
          return true;
        }
      });
    }

    questions.push({
      type: 'input',
      name: 'userName',
      message: 'User name?',
      validate: function (val) {
        if (!val) return 'Please enter user name';
        return true;
      }
    });

    return new Promise(resolve => {
      return inquirer.prompt(questions).then(answer => {
        resolve(answer);
      });
    });
  }).then((result) => {
    if (result.projectName) {
      target = pathFn.resolve(baseDir, result.projectName);
    }

    projectName = result.projectName || pathFn.basename(target);
    userName = result.userName;

    let dirArr = [
      pathFn.join(target, 'client/container'),
      pathFn.join(target, 'client/html'),
      pathFn.join(target, 'client/image'),
      pathFn.join(target, 'client/slice'),
      pathFn.join(target, 'client/style'),
      pathFn.join(target, 'config')
    ];

    dirArr.map(dir => {
      mkdirp.sync(dir);
    });

    copyConfig(target, projectName, userName, false);

    let packageJson = require('../../resources/package.json');
    packageJson['name'] = projectName;
    packageJson['author'] = userName;

    fs.writeFileSync(
      pathFn.join(target, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
  }).then(() => {
    let devDir = '_tmp';

    let distToHtml = pathFn.join(baseDir, 'html');
    let relDist = pathFn.relative(distToHtml, baseDir) + '/';
    relDist = relDist.replace(/\\/g, '/');

    let rootToHtml = pathFn.join(baseDir, 'container/html')
    let rootToDev = pathFn.relative(
      rootToHtml, pathFn.join(baseDir, devDir));
    rootToDev = rootToDev.replace(/\\/g, '/');

    return copyTemplate.call(this,
      pathFn.join(target, 'client/html'),
      'index.html', pathFn.join(__dirname, '../../resources/template.html'),
      [
        {
          match: /{__htmlTitle__}|{__cssName__}|{__jsName__}/g,
          replace: 'index'
        },
        { match: /{__path__}/g, replace: '' },
        { match: /{__devDir__}/g, replace: rootToDev },
        { match: /{__cssLayer__}/g, replace: relDist }
      ]
    ).then(() => {
      return copyTemplate.call(this,
        pathFn.join(target, 'client/container'),
        'index.js', pathFn.join(__dirname, '../../resources/template.js'),
        [
          { match: /{__stylePath__}/g, replace: 'client/style' },
          { match: /{__path__}/g, replace: '' },
          { match: /{__scssName__}/g, replace: 'index' }
        ]
      )
    }).then(() => {
      return copyTemplate.call(this,
        pathFn.join(target, 'client/style'), 'index.scss'
      )
    })
  }).then(() => {
    if (!args.install) return;

    log.info('Install dependencies');

    return spawn('npm', ['install'], {
      cwd: target,
      stdio: 'inherit'
    });
  }).then(() => {
    log.info('Project init with reco completely!');
  }).catch((err) => {
    log.error(err);
  });
}

function copyConfig(target, projectName, userName, postcss) {
  fs.createReadStream(pathFn.resolve(__dirname, '../../resources/config/userConfig.js'))
    .pipe(replaceStream(/\{__currentDir__\}/g, 'process.cwd()'))
    .pipe(replaceStream(/\{__projectName__\}/g, projectName))
    .pipe(replaceStream(/\{__userName__\}/g, userName))
    .pipe(replaceStream(/\{__postcss__\}/g, postcss))
    .pipe(fs.createWriteStream(pathFn.join(target, 'userConfig.js')));

  fs.createReadStream(pathFn.resolve(__dirname, '../../resources/config/pageConfig.js'))
    .pipe(fs.createWriteStream(pathFn.join(target, 'config/pageConfig.js')));
}

module.exports = initConsole;
