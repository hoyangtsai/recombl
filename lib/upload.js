const path = require('path');
const spawn = require('child_process').spawn;

const dirname = /(.*?)\/node_modules\/.*/.exec(__dirname.replace(/\\/g, '/')) === null ?
  __dirname : /(.*?)\/node_modules\/.*/.exec(__dirname.replace(/\\/g, '/'))[1];

let binGulp = dirname === process.env.PWD.replace(/\\/g, '/') ?
  path.join(process.env.PWD, 'node_modules/.bin/gulp') :
  path.join(process.env.MODULE_PATH, '.bin/gulp');
let gulpFile = path.resolve(__dirname, '../gulpfile.js');

spawn(`"${binGulp}"`, [ `--gulpfile "${gulpFile}"`, `upload_zip`, process.argv.slice(3).join(' ') ],
  { shell: true, stdio: 'inherit', env: process.env })
  .on('close', code => process.exit(code))
  .on('error', spawnError => console.error(`gulp error: ${spawnError}`))
