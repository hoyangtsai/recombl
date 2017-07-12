const path = require('path');
const fs = require('graceful-fs');
const Promise = require('bluebird');

function mkdirsSync(dir) {
  if (!dir) throw new TypeError('dir is required!');

  let parent = path.dirname(dir);

  if (!fs.existsSync(parent)) {
    mkdirsSync(parent);
  }
  fs.mkdirSync(dir);
}

function hasParentSync(dir) {
  if (!dir) throw new TypeError('dir is required!');

  let parent = path.dirname(dir);

  if (fs.existsSync(parent)) return;

  try {
    mkdirsSync(parent);
  } catch (err) {
    throw err;
  }
}

function writeFileSync(dir, data, options) {
  if (!dir) throw new TypeError('dir is required!');

  hasParentSync(dir);
  fs.writeFileSync(dir, data, options);
}

function copyFileSync(src, dest) {
  return new Promise((resolve, reject) => {
    try {
      writeFileSync(dest, fs.readFileSync(src));
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}



var readdirAsync = Promise.promisify(fs.readdir);

function trueFn() {
  return true;
}

function ignoreHiddenFiles(ignore) {
  if (!ignore) return trueFn;

  return function(item) {
    return item[0] !== '.';
  };
}

function ignoreFilesRegex(regex) {
  if (!regex) return trueFn;

  return function(item) {
    return !regex.test(item);
  };
}

function reduceFiles(result, item) {
  if (Array.isArray(item)) {
    return result.concat(item);
  }

  result.push(item);
  return result;
}

function _readAndFilterDir(path, options) {
  return readdirAsync(path)
    .filter(ignoreHiddenFiles(options.ignoreHidden == null ? true : options.ignoreHidden))
    .filter(ignoreFilesRegex(options.ignorePattern))
    .map(function(item) {
      var fullPath = join(path, item);

      return statAsync(fullPath).then(function(stats) {
        return {
          isDirectory: stats.isDirectory(),
          path: item,
          fullPath: fullPath
        };
      });
    });
}

function _listDir(path, options, parent) {
  options = options || {};
  parent = parent || '';

  return _readAndFilterDir(path, options).map(function(item) {
    if (item.isDirectory) {
      return _listDir(item.fullPath, options, join(parent, item.path));
    }

    return join(parent, item.path);
  }).reduce(reduceFiles, []);
}

function listDir(path, options, callback) {
  if (!path) throw new TypeError('path is required!');

  if (!callback && typeof options === 'function') {
    callback = options;
    options = {};
  }

  return _listDir(path, options).asCallback(callback);
}

// listDir
exports.listDir = listDir;

exports.mkdirsSync = mkdirsSync;
exports.copyFileSync = copyFileSync;
