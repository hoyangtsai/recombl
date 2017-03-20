#! /usr/bin/env node

const argv = require('minimist')(process.argv.slice(2));

if (argv['add'] || argv['_'].includes('add')) {
  console.log('add template');
  // require('../lib/add');
} else if (argv['watch'] || argv['w'] || argv['_'].includes('dev')) {
  // console.log('start dev');
  require('../lib/server');
} else if (argv['_'].includes('update')) {
  console.log('update config');
} else {
  require('../lib/webpack');
}
