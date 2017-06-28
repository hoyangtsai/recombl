const chalk = require('chalk');
const path = require('path');
const Promise = require('bluebird');
const Context = require('./context');
const minimist = require('minimist');

function entry(cwd, args) {
  cwd = cwd || process.cwd();
  args = minimist(process.argv.slice(2));

  var reco = new Context(cwd, args);

  // Change the title in console
  process.title = 'reco';

  function handleError(err) {
    if (err) {
      console.error(err);
    }
    process.exit(2);
  }

  require('./console')(reco);

  if (!args.h && !args.help) {
    cmd = args._.shift();

    if (cmd) {
      var c = reco.extend.console.get(cmd);
      if (!c) cmd = 'help';
    } else {
      cmd = 'help';
    }
  } else {
    cmd = 'help';
  }

  return reco.call(cmd, args).then(function() {
    return reco.exit();
  }).catch(function(err) {
    return reco.exit(err).then(function() {
      handleError(null);
    });
  });

}

// entry.console = {
//   help: require('./console/help'),
//   version: require('./console/version')
// };
// entry.version = require('../package.json').version;

module.exports = entry;
