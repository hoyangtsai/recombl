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

exports.mkdirsSync = mkdirsSync;
exports.copyFileSync = copyFileSync;
