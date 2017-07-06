const os = require('os');
const pkg = require('../../package.json');
const Promise = require('bluebird');

function versionConsole(args) {
  console.log('reco version:', pkg.version);
  console.log('os:', os.type(), os.release(), os.platform(), os.arch());

  return Promise.resolve();
}

module.exports = versionConsole;
