const should = require('chai').should();
const Context = require('../../lib/context');
const pathFn = require('path');
const fs = require('hexo-fs');
const Promise = require('bluebird');
const rewire = require('rewire');

describe('serve', function() {
  let baseDir = pathFn.join(__dirname, 'serve_test');

  let reco = new Context(baseDir, {silent: true});
  let initModule = rewire('../../lib/console/init');
  let init = initModule.bind(reco);

  let server = require('../../lib/console/serve').bind(reco2);

  // before(function() {
  //   return Promise.all([
  //   ]).then(function() {
  //     return init({ _: ['foobar'], u: 'ben' });
  //   });
  // });

  it('static asset', function() {

  });

  it('invalid port', function() {
    return server({port: -100}).catch(function(err) {
      err.should.have.property('message', 'Port number -100 is invalid. Try a number between 1 and 65535.');
    });
  });

  it('invalid port > 65535', function() {
    return server({port: 65536}).catch(function(err) {
      err.should.have.property('message', 'Port number 65536 is invalid. Try a number between 1 and 65535.');
    });
  });
});
