const chalk = require('chalk');
const path = require('path');
const Promise = require('bluebird');
const Context = require('./context');
const minimist = require('minimist');

function entry(cwd, args) {
  cwd = cwd || process.cwd();
  args = minimist(process.argv.slice(2));

  let reco = new Context(cwd, args);
  let log = reco.log;

  process.env.MODULE_PATH = path.resolve(__dirname, '../node_modules');
  process.env.DEV_DIR = '_tmp';
  process.env.PUBLISH_DIR = 'publish';
  process.env.PWD = process.cwd();

  function handleError(err) {
    if (err) {
      log.fatal(err);
    }

    process.exit(2);
  }

  return new Promise.try(function(mod) {
    if (mod) reco = mod;
    log = reco.log;

    require('./console')(reco);

    return reco.init();
  }).then(function() {
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
  }).catch(handleError);
}

entry.console = {
  init: require('./console/init'),
  help: require('./console/help'),
  version: require('./console/version')
};
entry.version = require('../package.json').version;

module.exports = entry;
