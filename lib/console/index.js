'use strict';

module.exports = function(ctx) {
  var console = ctx.extend.console;

  console.register('help', 'Get help on a command.', {}, require('./help'));

  console.register('version', 'Display version information.', {}, require('./version'));
};
