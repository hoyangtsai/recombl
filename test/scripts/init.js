'use strict';

var should = require('chai').should(); // eslint-disable-line
var pathFn = require('path');
// var fs = require('hexo-fs');
var Promise = require('bluebird');
var HashStream = require('../../util/hash');
var rewire = require('rewire');
var Context = require('../../lib/context');
var assetDir = pathFn.join(__dirname, '../../assets');
var fs = require('fs');
var utilFs = require('../../util/fs');

describe('init', function() {
  var baseDir = pathFn.join(__dirname, 'init_test');
  var initModule = rewire('../../lib/console/init');
  var reco = new Context(baseDir, { silent: true });
  var init = initModule.bind(reco);
  var assets = [];

  function rmdir(path) {
    return Promise.promisify(fs.rmdirSync(path)).catch(function(err) {
      if (err.cause && err.cause.code === 'ENOENT') return;
      throw err;
    });
  }

  function pipeStream(rs, ws) {
    return new Promise(function(resolve, reject) {
      rs.pipe(ws)
        .on('error', reject)
        .on('finish', resolve);
    });
  }

  function compareFile(a, b) {
    var streamA = new HashStream();
    var streamB = new HashStream();

    return Promise.all([
      pipeStream(fs.createReadStream(a), streamA),
      pipeStream(fs.createReadStream(b), streamB)
    ]).then(function() {
      return streamA.read().equals(streamB.read());
    });
  }

  function check(path) {
    return Promise.each(assets, function(item) {
      return compareFile(
        pathFn.join(assetDir, item),
        pathFn.join(path, item)
      ).should.eventually.be.true;
    }).finally(function() {
      return rmdir(path);
    });
  }

  function isFileExisted(file) {
    return Promise.all([
      fs.existsSync()
    ]).then(() => {
      return true;
    });
  }

  function check(path) {
    return Promise.try(() => {

    }).finally(() => {

    })
  }

  // before(function() {
  //   return utilFs.listDir(assetDir).then(function(files) {
  //     assets = files;
  //   });
  // });

  // after(function() {
  //   return rmdir(baseDir);
  // });

  it('project', function() {
    return init({ _: ['project'], u: 'user', install: false }).then(() => {
      return true;
    });
  });

});
