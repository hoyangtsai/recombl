const pathFn = require('path');
const fs = require('graceful-fs');
const Promise = require('bluebird');

function mkdirsSync(path) {
  if (!path) throw new TypeError('path is required!');

  let parent = pathFn.dirname(path);

  if (!fs.existsSync(parent)) {
    mkdirsSync(parent);
  }
  fs.mkdirSync(path);
}

function checkParentSync(path) {
  if (!path) throw new TypeError('path is required!');

  let parent = pathFn.dirname(path);

  if (fs.existsSync(parent)) return;

  try {
    mkdirsSync(parent);
  } catch (err) {
    throw err;
  }
}

function writeFileSync(path, data, options) {
  if (!path) throw new TypeError('path is required!');

  checkParentSync(path);
  fs.writeFileSync(path, data, options);
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

function rmdirSync(path) {
  if (!path) throw new TypeError('path is required!');

  let files = fs.readdirSync(path);
  let childPath;
  let stats;

  for (let i = 0, len = files.length; i < len; i++) {
    childPath = pathFn.join(path, files[i]);
    stats = fs.statSync(childPath);

    if (stats.isDirectory()) {
      rmdirSync(childPath);
    } else {
      fs.unlinkSync(childPath);
    }
  }

  fs.rmdirSync(path);
}

function readJson(file) {
  if (file in readJson.cache) return readJson.cache[file];
  let ret;
  try { ret = JSON.parse(fs.readFileSync(file)); }
  catch (e) { }  return readJson.cache[file] = ret;
}
readJson.cache = {};

exports.mkdirsSync = mkdirsSync;
exports.copyFileSync = copyFileSync;

exports.rmdirSync = rmdirSync;

exports.readJson = readJson;
