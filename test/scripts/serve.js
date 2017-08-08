const pathFn = require('path');
const should = require('chai').should();
const Promise = require('bluebird');
const hxFs = require('hexo-fs');
const Context = require('../../lib/context');
const request = require('supertest-promised');

describe('serve', function() {
  let baseDir = pathFn.join(__dirname);
  let reco = new Context(baseDir, {silent: true});
  let init = require('../../lib/console/init').bind(reco);
  let serve;
  let projectName = 'server_test';
  let userName = 'ben';

  function rmdir(path) {
    return hxFs.rmdir(path).catch(function(err) {
      if (err.cause && err.cause.code === 'ENOENT') return;
      throw err;
    });
  }

  function prepareServer(options) {
    options = options || {};
    return serve(options).then(function(server) {
      return server;
    }).disposer(function(server) {
      server.close();
    });
  }

  before(function() {
    return init({ _: [projectName], u: userName, install: false }).then(() => {
      baseDir = pathFn.join(baseDir, projectName);
      let babelrc = pathFn.join(baseDir, '.babelrc');
      return hxFs.unlink(babelrc);
    }).then(() => {
      reco.baseDir = baseDir;
      serve = require('../../lib/console/serve').bind(reco);
    })
  });

  after(function() {
    return rmdir(baseDir);
  });

  it('static asset', function() {
    // return Promise.using(prepareServer(), function(server) {
    //   return request(server).get('/client/html/index.html')
    //     .expect('Content-Type', 'text/html; charset=UTF-8')
    //     .expect(200)
    //     .end();
    // });
  });

  it('invalid port', function() {
    return serve({port: -100}).catch(function(err) {
      err.should.have.property('message',
        'Invalid port number of -100. Try another port number between 1 and 65535.');
    });
  });

  it('invalid port > 65535', function() {
    return serve({port: 65536}).catch(function(err) {
      err.should.have.property('message',
        'Invalid port number of 65536. Try another port number between 1 and 65535.');
    });
  });

  it('check port before starting', function() {
    return Promise.using(prepareServer(), function(app) {
      return serve().catch(function(err) {
        err.code.should.eql('EADDRINUSE');
      });
    });
  });

  it('change ip setting', function() {
    return serve({ip: '1.2.3.4'}).catch(function(err) {
      err.code.should.eql('EADDRNOTAVAIL');
    });
  });
});
