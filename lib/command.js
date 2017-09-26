const BaseCommand = require('common-bin');

require('colors');

class Command extends BaseCommand {
  constructor(rawArgv) {
    super(rawArgv);
    this.parserOptions = {
      execArgv: true,
      removeAlias: true,
    };
  }

  get context() {
    const context = super.context;

    // compatible
    if (context.debugPort) context.debug = context.debugPort;

    // remove unuse args
    context.argv.$0 = undefined;

    return context;
  }

  log(...args) {
    args[0] = `[${this.name}] `.blue + args[0]; // eslint-disable-line no-param-reassign
    console.log(...args);
  }
}

module.exports = Command;
