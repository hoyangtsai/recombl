const inquirer = require('inquirer');

const questions = [
  {
    type: 'input',
    name: 'project',
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
    name: 'username',
    message: 'Enter a user name?',
    validate: function (val) {
      if (!val) return 'Please enter a user name';
      return true;
    }
  }
];

inquirer.prompt(questions).then((answers) => {

});
