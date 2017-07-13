'use strict';

const should = require('chai').should();
const pathFn = require('path');
const Promise = require('bluebird');
const rewire = require('rewire');
const Context = require('../../lib/context');
const hxUtil = require('hexo-util');
const hxFs = require('hexo-fs');

describe('init', function() {
  let assetDir = pathFn.join(__dirname, '../../assets');
  let baseDir = pathFn.join(__dirname, 'init_test');
  let initModule = rewire('../../lib/console/init');
  let reco = new Context(baseDir, { silent: true });
  let init = initModule.bind(reco);
  let assets = [];

  function rmdir(path) {
    return hxFs.rmdir(path).catch(function(err) {
      if (err.cause && err.cause.code === 'ENOENT') return;
      throw err;
    });
  }

  function pipeStream(rs, ws) {
    return new Promise(function(resolve, reject) {
      rs.pipe(ws)
        .on('error', reject)
        .on('end', resolve);
    });
  }

  function compareFile(a, b) {
    let streamA = new hxUtil.HashStream();
    let streamB = new hxUtil.HashStream();

    return Promise.all([
      pipeStream(hxFs.createReadStream(a), streamA),
      pipeStream(hxFs.createReadStream(b), streamB)
    ]).then(function() {
      return streamA.read().equals(streamB.read());
    });
  }

  function check(path) {
    return Promise.each(assets, function(item) {
      return compareFile(
        pathFn.join(assetDir, item),
        pathFn.join(path, 'project' ,item)
      ).should.eventually.be.true;
    }).finally(function() {
      return rmdir(path);
    });
  }

  before(function() {
    return hxFs.listDir(assetDir).then(function(files) {
      assets = files;
    });
  });

  after(function() {
    return rmdir(baseDir);
  });

  it('project', function() {
    return init({ _: ['project'], u: 'user', install: false }).then(() => {
      return check(baseDir);
    });
  });
});
