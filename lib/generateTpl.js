const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const red = chalk.bold.red;
const yellow = chalk.bold.yellow;
const green = chalk.bold.green;

const htmlTpl = String(fs.readFileSync(path.join(__dirname, '../tpl/html.tpl')));
const jsTpl = String(fs.readFileSync(path.join(__dirname, '../tpl/js.tpl')));
const scssTpl = String(fs.readFileSync(path.join(__dirname, '../tpl/scss.tpl')));

//使用时第二个参数可以忽略
function funMkdirSync(dirpath, dirname) {
  //判断是否是第一次调用
  if (typeof dirname === "undefined") {
    if (fs.existsSync(dirpath)) {
      return;
    } else {
      funMkdirSync(dirpath, path.dirname(dirpath));
    }
  } else {
    //判断第二个参数是否正常，避免调用时传入错误参数
    if (dirname !== path.dirname(dirpath)) {
      funMkdirSync(dirpath);
      return;
    }
    if (fs.existsSync(dirname)) {
      fs.mkdirSync(dirpath)
    } else {
      funMkdirSync(dirname, path.dirname(dirname));
      fs.mkdirSync(dirpath);
    }
  }
}

function getLayerPath(str) {
  if (!str) {
    str = "/"; //解决QQ浏览器项目samePath为空的情况
  }
  let arr = str.split("/");
  let layerPath = "";
  let layer = arr.length;
  if (!arr[0]) {
    --layer;
  }
  if (!arr[arr.length - 1]) {
    --layer;
  }
  ++layer;
  for (; layer > 0; layer--) {
    layerPath += "../";
  }
  return layerPath;
}

module.exports = function(rootDir, config, fileName, cssName) {
  cssName = cssName || fileName;
  let filePath = config.path;
  let arrFolder = fileName.split("/");
  let fileCssLayer = getLayerPath(config.path);
  let fileJsLayer = fileCssLayer + '../';
  for (let i = 0, j = arrFolder.length; i < j - 1; i++) {
    if (!!arrFolder[i]) {
      filePath += "/" + arrFolder[i];
      fileCssLayer += "../";
      fileJsLayer += "../";
    }
  }
  let fullPath;
  try {
    fullPath = path.join(rootDir, config.htmlPath, config.path, `${fileName}.html`);
    if (fs.existsSync(fullPath)) {
      console.log(yellow(`${fullPath} 已存在`));
    } else {
      let fileHtml = htmlTpl.replace(/\{__htmlTitle__\}/g, function(match) {
        return fileName;
      });
      fileHtml = fileHtml.replace(/\{__samePath__\}/g, function(match) {
        return config.path;
      });
      fileHtml = fileHtml.replace(/\{__cssName__\}/g, function(match) {
        return cssName;
      });
      fileHtml = fileHtml.replace(/\{__jsName__\}/g, function(match) {
        return fileName;
      });
      fileHtml = fileHtml.replace(/\{__cssLayer__\}/g, function(match) {
        return fileCssLayer;
      });
      fileHtml = fileHtml.replace(/\{__jsLayer__\}/g, function(match) {
        return fileJsLayer;
      });
      funMkdirSync(config.htmlPath + filePath);
      fs.writeFileSync(fullPath, fileHtml);
      console.log(green(`${fullPath} 正常生成`));
    }
  } catch (e) {
    console.log(red(`Error fileHtml: ${e}`));
  }
  try {
    fullPath = path.join(rootDir, config.jsPath, config.path, `${fileName}.js`);
    if (fs.existsSync(fullPath)) {
      console.log(yellow(`${fullPath} 已存在`));
    } else {
      let fileJs = jsTpl.replace(/\{__samePath__\}/g, function(match) {
        return config.path;
      });
      fileJs = fileJs.replace(/\{__scssName__\}/g, function(match) {
        return fileName;
      });
      funMkdirSync(config.jsPath + filePath);
      fs.writeFileSync(fullPath, fileJs);
      console.log(green(`${fullPath} 正常生成`));
    }
  } catch (e) {
    console.log(red(`Error fileJs: ${e}`));
  }
  try {
    fullPath = path.join(rootDir, config.cssPath, config.path, `${fileName}.scss`);
    if (fs.existsSync(fullPath)) {
      console.log(yellow(`${fullPath} 已存在`));
    } else {
      funMkdirSync(config.cssPath + filePath);
      fs.writeFileSync(`${fullPath}`, scssTpl);
      console.log(green(`${fullPath} 正常生成`));
    }
  } catch (e) {
    console.log(red(`Error fileSass: ${e}`));
  }
}
