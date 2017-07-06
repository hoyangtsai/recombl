'use strict';

module.exports = function(ctx) {
  var console = ctx.extend.console;

  console.register('help', 'Print instruction.', {}, require('./help'));

  console.register('init', 'Create a new reco folder.', {
    desc: 'Create a new reco folder at the current directory.',
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
      {name: '-o, --open', desc: 'Open browser directly via the default one.'}
    ]
  }, require('./server'));

  console.register('version', 'Show the installed version.', {}, require('./version'));
};
