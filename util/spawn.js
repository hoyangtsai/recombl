const spawn = require('cross-spawn');
const Promise = require('bluebird');
const CacheStream = require('./cache_stream');

function promiseSpawn(command, args, options) {
  if (!command) throw new TypeError('command is required!');

  if (!options && args && !Array.isArray(args)) {
    options = args;
    args = [];
  }

  args = args || [];
  options = options || {};

  return new Promise(function(resolve, reject) {
    let task = spawn(command, args, options);
    let verbose = options.verbose;
    let encoding = options.hasOwnProperty('encoding') ? options.encoding : 'utf8';
    let stdoutCache = new CacheStream();
    let stderrCache = new CacheStream();

    if (task.stdout) {
      let stdout = task.stdout.pipe(stdoutCache);
      if (verbose) stdout.pipe(process.stdout);
    }

    if (task.stderr) {
      let stderr = task.stderr.pipe(stderrCache);
      if (verbose) stderr.pipe(process.stderr);
    }

    task.on('close', function(code) {
      if (code) {
        let e = new Error(getCache(stderrCache, encoding));
        e.code = code;

        return reject(e);
      }

      resolve(getCache(stdoutCache, encoding));
    });

    task.on('error', reject);

    // Listen to exit events if neither stdout and stderr exist (inherit stdio)
    if (!task.stdout && !task.stderr) {
      task.on('exit', function(code) {
        if (code) {
          let e = new Error('Spawn failed');
          e.code = code;

          return reject(e);
        }

        resolve();
      });
    }
  });
}

function getCache(stream, encoding) {
  let buf = stream.getCache();
  stream.destroy();
  if (!encoding) return buf;

  return buf.toString(encoding);
}

module.exports = promiseSpawn;
