const debug = require('debug')('nodinx-cli');
const Command = require('../command');

class BuildCommand extends Command {

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
      minimize: {
        desc: 'minimize static file like css and js',
        alias: 'm',
        type: 'boolean',
        default: false,
      },
    };
  }

  get description() {
    return 'Run build project';
  }

  * run(context) {
    console.log('Run build cmd: argv:', this.yargs.argv);
  }
}

module.exports = BuildCommand;
