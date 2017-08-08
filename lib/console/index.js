module.exports = function(ctx) {
  let console = ctx.extend.console;

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

  console.register('serve', 'Start webpack server.', {
    desc: 'Starting webpack server within a reco project folder.',
    options: [
      {name: '-i, --ip', desc: 'Overwrite the default server ip.'},
      {name: '-p, --port', desc: 'Overwrite the default server port.'},
      {name: '-o, --open', desc: 'Open browser directly via the preference one.'}
    ]
  }, require('./serve'));

  console.register('new', 'Generate new templates.', {
    desc: 'Generate new templates by pageConfig entry.',
  }, require('./new'));

  console.register('build', 'Output static html, css and js files.', {
    desc: 'Based on source output static assets.',
    options: [
      {name: '-m, --minimize', desc: 'Minimize output files.'},
      {name: '--no-html', desc: 'Not output static html files.'}
    ]
  }, require('./build'));

  console.register('version', 'Show the installed version.',
    {}, require('./version'));
};
