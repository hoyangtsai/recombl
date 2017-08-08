const pathFn = require('path');
const logger = require('hexo-log');
const EventEmitter = require('events').EventEmitter;
const Promise = require('bluebird');
const ConsoleExtend = require('./extend/console');

process.env.MODULE_PATH = pathFn.resolve(__dirname, '../node_modules');
process.env.PUBLISH_DIR = 'publish';
process.env.PWD = process.cwd();

function Context(base, args) {
  base = base || process.cwd();
  args = args || {};

  EventEmitter.call(this);

  this.baseDir = base;
  this.log = logger(args);
  this.args = args;

  this.extend = {
    console: new ConsoleExtend()
  };
}

require('util').inherits(Context, EventEmitter);

Context.prototype.init = function() {
  // Do nothing
};

Context.prototype.call = function(name, args, callback) {
  if (!callback && typeof args === 'function') {
    callback = args;
    args = {};
  }

  let self = this;

  return new Promise(function(resolve, reject) {
    let c = self.extend.console.get(name);

    if (c) {
      c.call(self, args).then(resolve, reject);
    } else {
      reject(new Error('Console `' + name + '` has not been registered yet!'));
    }
  }).asCallback(callback);
};

Context.prototype.exit = function(err) {
  if (err) {
    this.log.fatal(
      {err: err}
    );
  }

  return Promise.resolve();
};

Context.prototype.unwatch = function() {
  // Do nothing
};

module.exports = Context;
