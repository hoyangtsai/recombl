'use strict';

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

function checkParentSync(dir) {
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

  checkParentSync(dir);
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

function rmdirSync(path) {
  if (!path) throw new TypeError('path is required!');

  var files = fs.readdirSync(path);
  var childPath;
  var stats;

  for (var i = 0, len = files.length; i < len; i++) {
    childPath = join(path, files[i]);
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
