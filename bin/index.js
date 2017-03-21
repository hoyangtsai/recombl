#! /usr/bin/env node

const path = require('path');
const argv = require('minimist')(process.argv.slice(2));

process.env.MODULE_PATH = path.resolve(__dirname, '../node_modules');

if (argv['watch'] || argv['w'] || argv['_'].includes('dev')) {
  process.env.DEV = true;
  require('../lib/server');
} else if (argv['add'] || argv['_'].includes('add')) {
  console.log('add template');
  // require('../lib/add');
}

// else {
//   require('../lib/webpack');
// }
