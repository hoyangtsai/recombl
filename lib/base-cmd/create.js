const debug = require('debug')('nodinx-cli');
const Command = require('../command');

class CreateCommand extends Command {

  constructor(rawArgv) {
    super(rawArgv);

    this.usage = 'Usage: nodx create [type] [options]';
    this.options = {
      name: {
        desc: 'the name of module or component',
        alias: 'n',
        type: 'string',
        default: 'foo',
      },
    };
  }

  get description() {
    return 'Run create module or component';
  }

  * run(context) {
    console.log('Run create cmd: argv:', this.yargs.argv);
  }
}

module.exports = CreateCommand;
