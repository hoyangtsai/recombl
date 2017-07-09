'use strict';

module.exports = function(ctx) {
  var console = ctx.extend.console;

  console.register('help', 'Print instruction.', {}, require('./help'));

  console.register('init', 'Create a new project folder.', {
    desc: 'Create a new folder at the current directory.',
    usage: '[name]',
    arguments: [
      {name: 'name', desc: 'Folder name.'}
    ],
    options: [
      {name: '--no-install', desc: 'Skip npm install'}
    ]
  }, require('./init'));

  console.register('server', 'Start webpack server.', {
    desc: 'Starting webpack server within a project folder.',
    options: [
      {name: '-p, --port', desc: 'Overwrite the default server port.'},
      {name: '-o, --open', desc: 'Open browser directly via the preference one.'}
    ]
  }, require('./server'));

  console.register('new', 'Generate new templates.', {
    desc: 'Generate new templates by the config entry.',
  }, require('./new'));

  console.register('version', 'Show the installed version.',
    {}, require('./version'));
};
