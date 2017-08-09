const spawn = require('../../util/spawn');
const pathFn = require('path');

module.exports = function(args) {
  let log = this.log;

  let dirname = /(.*?)\/node_modules\/.*/.exec(__dirname.replace(/\\/g, '/')) === null ?
    __dirname : /(.*?)\/node_modules\/.*/.exec(__dirname.replace(/\\/g, '/'))[1];

  let binGulp = dirname === process.env.PWD.replace(/\\/g, '/') ?
    pathFn.join(process.env.PWD, 'node_modules/.bin/gulp') :
    pathFn.join(process.env.MODULE_PATH, '.bin/gulp');

  let gulpFile = pathFn.resolve(__dirname, '../../gulpfile.js');

  return spawn(`"${binGulp}"`, [
    `--gulpfile "${gulpFile}"`, `upload`, process.argv.slice(3) ],
    { shell: true, stdio: 'inherit', env: process.env }
  ).catch(err => {
    log.error(err);
  })
}
