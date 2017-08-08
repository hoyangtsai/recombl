const should = require('chai').should();
const Context = require('../../lib/context');
const pathFn = require('path');
const fs = require('hexo-fs');
const Promise = require('bluebird');
const rewire = require('rewire');

describe('new', function() {
  let baseDir = pathFn.join(__dirname, 'new_test');
  let reco = new Context(baseDir, {silent: true});
  let initModule = rewire('../../lib/console/init');
  let init = initModule.bind(reco);

  before(function() {
  });

  it('generate new template', function() {

  });

});
