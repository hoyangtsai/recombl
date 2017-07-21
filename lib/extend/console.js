const Promise = require('bluebird');

function Console() {
  this.store = {};
  this.alias = {};
}

Console.prototype.get = function(name) {
  name = name.toLowerCase();
  return this.store[this.alias[name]];
};

Console.prototype.list = function() {
  return this.store;
};

Console.prototype.register = function(name, desc, options, fn) {
  if (!name) throw new TypeError('name is required');

  if (!fn) {
    if (options) {
      if (typeof options === 'function') {
        fn = options;

        if (typeof desc === 'object') { // name, options, fn
          options = desc;
          desc = '';
        } else { // name, desc, fn
          options = {};
        }
      } else {
        throw new TypeError('fn must be a function');
      }
    } else {
      // name, fn
      if (typeof desc === 'function') {
        fn = desc;
        options = {};
        desc = '';
      } else {
        throw new TypeError('fn must be a function');
      }
    }
  }

  if (fn.length > 1) {
    fn = Promise.promisify(fn);
  } else {
    fn = Promise.method(fn);
  }

  let c = this.store[name.toLowerCase()] = fn;
  c.options = options;
  c.desc = desc;

  let entry = {};
  Object.keys(this.store).map(cmd => {
    entry[cmd] = cmd;
  });

  this.alias = entry;
};

module.exports = Console;
