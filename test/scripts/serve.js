const should = require('chai').should();
const Context = require('../../lib/context');
const pathFn = require('path');
const fs = require('hexo-fs');
const Promise = require('bluebird');

describe('serve', function() {
  let baseDir = pathFn.join(__dirname, 'serve_test');
  let reco = new Context(baseDir, {silent: true});
  let init = require('../../lib/console/init').bind(reco);
  let serve;

  before(function() {
    return init({ _: ['foobar'], u: 'ben', install: false }).then(() => {
      reco.baseDir = pathFn.join(baseDir, 'foobar');
      serve = require('../../lib/console/serve').bind(reco);
    })
  });

  it('static asset', function() {

  });

  it('invalid port', function() {
    return serve({port: -100}).catch(function(err) {
      err.should.have.property('message',
        'Port number -100 is invalid. Try a port number between 1 and 65535.');
    });
  });

  it('invalid port > 65535', function() {
    return serve({port: 65536}).catch(function(err) {
      err.should.have.property('message',
        'Port number 65536 is invalid. Try a port number between 1 and 65535.');
    });
  });
});
