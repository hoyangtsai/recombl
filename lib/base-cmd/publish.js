const debug = require('debug')('nodinx-cli');
const Command = require('../command');

class PublishCommand extends Command {

  constructor(rawArgv) {
    super(rawArgv);

    this.usage = 'Usage: nodx publish [env] [options]';
    this.options = {
      debug: {
        desc: 'show debug log',
        alias: 'd',
        type: 'boolean',
        default: false,
      },
    };
  }

  get description() {
    return 'Run publish project to difference env';
  }

  * run(context) {
    console.log('Run publish cmd: argv:', this.yargs.argv);
  }
}

module.exports = PublishCommand;
