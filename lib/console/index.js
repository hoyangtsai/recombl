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

  console.register('dev', 'Start webpack and dev server.', {
    desc: 'Start webpack and dev server within a project folder.',
    options: [
      {name: '--port | -p', desc: 'Serving port.'},
      {name: '--open | -o', desc: 'Open browser.'}
    ]
  }, require('./serve'));

  console.register('version', 'Show the installed version.', {}, require('./version'));
};
