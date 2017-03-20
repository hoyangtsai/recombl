#! /usr/bin/env node

require('babel-register');

const argv = require('minimist')(process.argv.slice(2));

if (argv['add'] || argv['_'].includes('add')) {
  console.log('add template');
  // require('../lib/add');
}

if (argv['watch'] || argv['w'] || argv['_'].includes('dev')) {
  // console.log('start dev');
  require('../lib/server');
}

if (argv['_'].includes('update')) {
  console.log('update config');
}

require('../lib/server');
