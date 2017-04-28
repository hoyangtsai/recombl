#! /usr/bin/env node

const path = require('path');
const argv = require('minimist')(process.argv.slice(2));

process.env.MODULE_PATH = path.resolve(__dirname, '../node_modules');
process.env.DEV_DIR = '_tmp';
process.env.PUBLISH_DIR = 'publish';

if (argv['w'] || argv['_'].includes('dev') || argv['watch']) {
  process.env.NODE_ENV = 'development';
  require('../lib/server');
} else if (argv['new'] || argv['_'].includes('new')) {
  require('../lib/new');
} else if (argv['pub'] || argv['_'].includes('publish')) {
  require('../lib/publish');
} else if (argv['init'] || argv['_'].includes('init')) {
  require('../lib/init');
} else if (argv['upload'] || argv['_'].includes('upload')) {
  require('../lib/upload');
} else if (argv.h || argv.help) {
  console.log([
    'usage: reco [option]',
    '',
    'option:',
    '  -w --watch [-p | --port] [-open]   Start webpack and webpack-dev-server. Default port is [6001].',
    '  --new                              Generate new html, js and scss file templates based on the entry in pageConfig.js',
    '  -pub --publish                     Generate static html, js, css files to the publish folder.',
    '  -h --help                          Print instruction and exit.'
  ].join('\n'));
  process.exit();
} else {
  console.log(`Unknown options.`);
  process.exit();
}
