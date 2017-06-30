'use strict';

module.exports = function(ctx) {
  var console = ctx.extend.console;

  console.register('help', 'Print instruction.', {}, require('./help'));

  console.register('init', 'Create a new Reco folder.', {
    desc: 'Create a new Reco folder at the current folder.',
    usage: '[folder_name]',
    arguments: [
      {name: 'folder_name', desc: 'Folder name.'}
    ],
    options: [
      {name: '--no-install', desc: 'Skip npm install'}
    ]
  }, require('./init'));

  console.register('version', 'Show the installed version.', {}, require('./version'));
};
