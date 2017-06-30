const path = require('path');
const fs = require('fs');
const inquirer = require('inquirer');
const mkdirp = require('mkdirp');
const replaceStream = require('replacestream');
const generateTpl = require('../generateTpl.js');
const argv = require('optimist').argv;
const spawn = require('../../util/spawn');
const assign = require('object-assign');

function initConsole(args) {
  args = assign({
    install: true,
  }, args);

  let baseDir = this.base_dir;
  let target = args._[0] ? path.resolve(baseDir, args._[0]) : baseDir;
  // no target
  if (!args._[0]) {

  }
  let log = this.log;
  let promise;
  let npmCommand;

  let questions = [
    {
      type: 'input',
      name: 'projectName',
      message: 'Project name?',
      validate: function (val) {
        if (!val) return 'Please enter a project name';
        return true;
      }
    },
    {
      type: 'input',
      name: 'userName',
      message: 'User name? (RTX name)',
      validate: function (val) {
        if (!val) return 'Please enter a user name';
        return true;
      }
    }
  ];



  inquirer.prompt(questions).then((ans) => {
    let dest = path.join(process.cwd(), ans.projectName);
    if (fs.existsSync(dest)) {
      console.error('Folder exists!');
      process.exit();
    }

    let dirArr = [
      path.join(dest, 'client/container'),
      path.join(dest, 'client/html'),
      path.join(dest, 'client/image'),
      path.join(dest, 'client/slice'),
      path.join(dest, 'client/style'),
      path.join(dest, 'config')
    ];

    for (let i in dirArr) {
      mkdirp.sync(dirArr[i]);
    }

    let packageJson = require('../tpl/package.json');
    packageJson['name'] = ans.projectName;
    packageJson['author'] = ans.userName;

    copyConfig(dest, ans, false);
    fs.writeFileSync(path.join(dest, 'package.json'), JSON.stringify(packageJson, null, 2));

    generateTpl(dest,
      { htmlPath: 'client/html',
        jsPath: 'client/container',
        cssPath: 'client/style', path: ''},
      'index'
    );
  });
}

function copyConfig(dest, ans, postcss) {
  fs.createReadStream(path.resolve(__dirname, '../tpl/config/userConfig.js'))
    .pipe(replaceStream(/\{__currentDir__\}/g, 'process.cwd()'))
    .pipe(replaceStream(/\{__projectName__\}/g, ans.projectName))
    .pipe(replaceStream(/\{__userName__\}/g, ans.userName))
    .pipe(replaceStream(/\{__postcss__\}/g, postcss))
    .pipe(fs.createWriteStream(path.join(dest, 'userConfig.js')));

  fs.createReadStream(path.resolve(__dirname, '../tpl/config/pageConfig.js'))
    .pipe(fs.createWriteStream(path.join(dest, 'config/pageConfig.js')));
}

module.exports = initConsole;
