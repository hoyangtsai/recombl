'use strict';

module.exports = function(ctx) {
  var console = ctx.extend.console;

  console.register('help', 'Print instruction.', {}, require('./help'));

  console.register('version', 'Show the installed version.', {}, require('./version'));
};
