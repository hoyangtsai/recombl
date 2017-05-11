#! /usr/bin/env node

const path = require('path');
const argv = require('minimist')(process.argv.slice(2));

process.env.MODULE_PATH = path.resolve(__dirname, '../node_modules');
process.env.DEV_DIR = '_tmp';
process.env.PUBLISH_DIR = 'publish';
process.env.PWD = process.cwd();
process.env.ROOT = path.resolve(__dirname, '..');

if (argv['_'].includes('init')) {
  require('../lib/init');
} else if (argv['w'] || argv['_'].includes('dev') || argv['_'].includes('watch')) {
  process.env.NODE_ENV = 'development';
  require('../lib/server');
} else if (argv['_'].includes('new')) {
  require('../lib/new');
} else if (argv.p || argv['_'].includes('publish')) {
  require('../lib/publish');
} else if (argv['_'].includes('upload')) {
  require('../lib/upload');
} else if (argv.v || argv.version) {
  console.log(require('../package.json').version);
} else if (argv.h || argv.help || argv['_'].includes('help')) {
  console.log([
    'usage: reco [option] [args]',
    '',
    'option:',
    '  init                                       Generate a new project folder with a basic config.',
    '  watch -w dev [-p | --port] [-o | --open]   Start webpack-dev-server with inline mode and HDR. Default port is [6001].',
    '  new                                        Generate new template of html, js and scss files based on the pageConfig.js entry.',
    '  publish -p [--min | --compress]            Generate static html, js, css files to the publish folder.',
    '  -h --help                                  Print instruction and exit.'
  ].join('\n'));
  process.exit();
} else {
  console.log(`Unknown option.`);
  process.exit();
}
