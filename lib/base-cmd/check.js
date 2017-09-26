const debug = require('debug')('nodinx-cli');
const Command = require('../command');

class CheckCommand extends Command {

  constructor(rawArgv) {
    super(rawArgv);

    this.usage = 'Usage: nodx check [options]';
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
    return 'Run check project code style';
  }

  * run(context) {
    console.log('Run check cmd: argv:', this.yargs.argv);
  }
}

module.exports = CheckCommand;
