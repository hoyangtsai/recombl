const should = require('chai').should();
const Context = require('../../lib/context');
const sinon = require('sinon');
const os = require('os');
const format = require('util').format;
const cliVersion = require('../../package.json').version;
const rewire = require('rewire');

function getConsoleLog(spy) {
  var args = spy.args;

  return args.map(function(arr) {
    return format.apply(null, arr);
  }).join('\n');
}

describe('version', function() {
  var versionModule = rewire('../../lib/console/version');
  var reco = new Context();

  it('show version info', function() {
    var spy = sinon.spy();

    return versionModule.__with__({
      console: {
        log: spy
      }
    })(function() {
      return versionModule.call(reco, { _: [] });
    }).then(function() {
      var output = getConsoleLog(spy);
      var expected = [
        'reco-cli: ' + cliVersion,
        'os: ' + os.type() + ' ' + os.release() + ' ' + os.platform() + ' ' + os.arch()
      ];

      output.should.eql(expected.join('\n'));
    });
  });
});
