const path = require('path');
const fs = require('fs');
const inquirer = require('inquirer');
const mkdirp = require('mkdirp');
const replaceStream = require('replacestream');
const generateTpl = require('./generateTpl.js');

const argv = require('optimist').argv;
const config = argv.config || argv['_'].includes('config');

function copyConfig(dest, comp, feat, ans, postcss) {
  fs.createReadStream(path.resolve(__dirname, '../tpl/config/userConfig.js'))
    .pipe(replaceStream(/\{__component__\}/g, comp.name))
    .pipe(replaceStream(/\{__componentPath__\}/g, comp.path))
    .pipe(replaceStream(/\{__feature__\}/g, feat.name))
    .pipe(replaceStream(/\{__featurePath__\}/g, feat.path))
    .pipe(replaceStream(/\{__projectName__\}/g, ans.projectName))
    .pipe(replaceStream(/\{__userName__\}/g, ans.userName))
    .pipe(replaceStream(/\{__postcss__\}/g, postcss))
    .pipe(fs.createWriteStream(path.join(dest, 'userConfig.js')));

  fs.createReadStream(path.resolve(__dirname, '../tpl/config/pageConfig.js'))
    .pipe(fs.createWriteStream(path.join(dest, 'config/pageConfig.js')));
}

if (config) {
  let questions = [
    {
      type: 'list',
      name: 'component',
      message: 'Which component library used?',
      choices: ['应用宝', 'QQ浏览器'],
      filter: function(val) {
        if (val === '应用宝') {
          return 'myapp';
        } else if (val === 'QQ浏览器') {
          return 'qqbrowser';
        }
      }
    }
  ];

  let dest = process.cwd();

  mkdirp.sync(path.join(dest, 'config'));

  inquirer.prompt(questions).then((ans) => {
    let packageJson = require(path.join(dest, 'package.json'));

    ans['projectName'] =  path.basename(dest);
    ans['userName'] = packageJson.author;

    if (ans.component === 'myapp') {
      packageJson['devDependencies']['myapp'] = `git+http://${ans.userName}@git.code.oa.com/myapp/component.git`;

      copyConfig(dest,
        { name: 'myapp/component', path: path.join(dest, 'node_modules/myapp') },
        { name: 'myapp', path: dest },
        ans, false
      );
    } else if (ans.component === 'qqbrowser') {
      packageJson['devDependencies']['react-guide'] = `git+http://${ans.userName}@git.code.oa.com/mxd/react-guide.git#develop`;

      copyConfig(dest,
        { name: 'react-guide', path: path.join(dest, 'node_modules/@tencent/react-guide') },
        { name: 'qqbrowser', path: dest },
        ans,
        '[\r\n' +
        'require("autoprefixer")({browsers:["last 4 versions", "Android >= 4.0", "Chrome >= 37", "iOS>=7"]}),\r\n' +
        'require("postcss-flexbugs-fixes"),\r\n' +
        'require("postcss-gradientfixer")\r\n' +
        ']'
      );
    }

    fs.writeFileSync(path.join(dest, 'package.json'), JSON.stringify(packageJson, null, 2));
  });

} else {
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
      type: 'list',
      name: 'component',
      message: 'Which component library?',
      choices: ['应用宝', 'QQ浏览器'],
      filter: function(val) {
        if (val === '应用宝') {
          return 'myapp';
        } else if (val === 'QQ浏览器') {
          return 'qqbrowser';
        }
      }
    },
    {
      type: 'input',
      name: 'userName',
      message: 'User name?',
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
      return false;
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

    if (ans.component === 'myapp') {
      packageJson['devDependencies']['myapp'] = `git+http://${ans.userName}@git.code.oa.com/myapp/component.git`;

      copyConfig(dest,
        { name: 'myapp/component', path: path.join(dest, 'node_modules/myapp') },
        { name: 'myapp', path: dest },
        ans, false
      );
    } else if (ans.component === 'qqbrowser') {
      packageJson['devDependencies']['react-guide'] = `git+http://${ans.userName}@git.code.oa.com/mxd/react-guide.git#develop`;

      copyConfig(dest,
        { name: 'react-guide', path: path.join(dest, 'node_modules/@tencent/react-guide') },
        { name: 'qqbrowser', path: dest },
        ans,
        '[\r\n' +
        'require("autoprefixer")({browsers:["last 4 versions", "Android >= 4.0", "Chrome >= 37", "iOS>=7"]}),\r\n' +
        'require("postcss-flexbugs-fixes"),\r\n' +
        'require("postcss-gradientfixer")\r\n' +
        ']'
      );
    }
    fs.writeFileSync(path.join(dest, 'package.json'), JSON.stringify(packageJson, null, 2));

    generateTpl(dest,
      { htmlPath: 'client/html', jsPath: 'client/container', cssPath: 'client/style', path: ''},
      'index'
    );
  });
}