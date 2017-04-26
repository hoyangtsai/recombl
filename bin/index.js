#! /usr/bin/env node

const path = require('path');
const argv = require('minimist')(process.argv.slice(2));

process.env.MODULE_PATH = path.resolve(__dirname, '../node_modules');
process.env.DEV_DIR = '_tmp';
process.env.PUBLISH_DIR = 'publish';

if (argv['watch'] || argv['w'] || argv['_'].includes('dev')) {
  process.env.NODE_ENV = 'development';
  require('../lib/server');
} else if (argv['new'] || argv['_'].includes('new')) {
  require('../lib/new');
} else if ( argv['publish'] || argv['p']  || argv['_'].includes('publish') ) {
  require('../lib/publish');
} else if ( argv['init'] || argv['_'].includes('init') ) {
  require('../lib/init');
}
