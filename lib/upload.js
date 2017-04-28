const path = require('path');
const spawn = require('child_process').spawn;

const binGulp = path.join(process.env.MODULE_PATH, '.bin/gulp');
const gulpFile = path.resolve(__dirname, '../gulpfile.js');

spawn(binGulp, [ `--gulpfile ${gulpFile}`, `upload_zip` ],
  { shell: true, stdio: 'inherit', env: process.env })
  .on('close', code => process.exit(code))
  .on('error', spawnError => console.error(`gulp error: ${spawnError}`))
