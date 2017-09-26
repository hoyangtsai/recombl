const path = require('path');
const Command = require('./command');

class NodinxCli extends Command {

  constructor(rawArgv) {
    super(rawArgv);

    this.name = 'nodx';
    this.usage = 'Usage: nodx [command] [options]';

    // load directory
    this.load(path.join(__dirname, 'cmd'));
  }
}

module.exports = exports = NodinxCli;