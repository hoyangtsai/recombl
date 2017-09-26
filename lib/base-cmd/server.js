const debug = require('debug')('nodinx-cli');
const Command = require('../command');


class ServerCommand extends Command {

  constructor(rawArgv) {
    super(rawArgv);

    this.usage = 'Usage: nodx server [env] [options]';
    this.options = {
      port: {
        desc: 'http port',
        alias: 'p',
        type: 'number',
        default: 8080,
      },
      open: {
        desc: 'whethe open the browser',
        alias: 'o',
        type: 'boolean',
        default: false,
      },
    };
  }

  get description() {
    return 'Run webpack dev server';
  }

  * run(context) {
    console.log('Run server cmd: argv:', this.yargs.argv);
  }
}

module.exports = ServerCommand;
