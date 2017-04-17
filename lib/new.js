const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const red = chalk.bold.red;
const yellow = chalk.bold.yellow;
const green = chalk.bold.green;

const userConfig = require(path.join(process.cwd(), 'userConfig'));
const pageConfig = require(path.join(process.cwd(), userConfig.pageConfig));
const baseConfig = Object.assign(userConfig, pageConfig);

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

const htmlTpl = String(fs.readFileSync(path.join(__dirname, '../tpl/html.tpl')));
const jsTpl = String(fs.readFileSync(path.join(__dirname, '../tpl/js.tpl')));
const scssTpl = String(fs.readFileSync(path.join(__dirname, '../tpl/scss.tpl')));

const cssLayer = getLayerPath(baseConfig.path);
const jsLayer = cssLayer + "../";

function initFile(fileName, cssName) {
  cssName = cssName || fileName;
  let filePath = baseConfig.path;
  let arrFolder = fileName.split("/");
  let fileCssLayer = cssLayer;
  let fileJsLayer = jsLayer;
  for (let i = 0, j = arrFolder.length; i < j - 1; i++) {
    if (!!arrFolder[i]) {
      filePath += "/" + arrFolder[i];
      fileCssLayer += "../";
      fileJsLayer += "../";
    }
  }
  try {
    let exists = fs.existsSync(baseConfig.htmlPath + baseConfig.path + `/${fileName}.html`);
    if (exists) {
      console.log(yellow(`${fileName}.html 已存在`));
    } else {
      let fileHtml = htmlTpl.replace(/\{__htmlTitle__\}/g, function(match) {
        return fileName;
      });
      fileHtml = fileHtml.replace(/\{__samePath__\}/g, function(match) {
        return baseConfig.path;
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
      funMkdirSync(baseConfig.htmlPath + filePath);
      fs.writeFileSync(baseConfig.htmlPath + baseConfig.path + `/${fileName}.html`, fileHtml);
      console.log(green(`${fileName}.html 正常生成`));
    }
  } catch (e) {
    console.log(red(`Error fileHtml: ${e}`));
  }
  try {
    let exists = fs.existsSync(baseConfig.jsPath + baseConfig.path + '/' + fileName + '.js');
    if (exists) {
      console.log(yellow(fileName + '.js已存在'));
    } else {
      let fileJs = jsTpl.replace(/\{__samePath__\}/g, function(match) {
        return baseConfig.path;
      });
      fileJs = fileJs.replace(/\{__scssName__\}/g, function(match) {
        return fileName;
      });
      funMkdirSync(baseConfig.jsPath + filePath);
      fs.writeFileSync(baseConfig.jsPath + baseConfig.path + '/' + fileName + '.js', fileJs);
      console.log(green(fileName + '.js正常生成'));
    }
  } catch (e) {
    console.log(red('Error fileJs:' + e));
  }
  try {
    let exists = fs.existsSync(baseConfig.cssPath + baseConfig.path + '/' + fileName + '.scss');
    if (exists) {
      console.log(yellow(fileName + '.scss已存在'));
    } else {
      funMkdirSync(baseConfig.cssPath + filePath);
      fs.writeFileSync(baseConfig.cssPath + baseConfig.path + '/' + fileName + '.scss', scssTpl);
      console.log(green(fileName + '.scss正常生成'));
    }
  } catch (e) {
    console.log(red('Error fileSass:' + e));
  }
}

if (Array.isArray(baseConfig.entry)) {
  for (let i in baseConfig.entry) {
    let fileName = baseConfig.entry[i];
    fileName && initFile(fileName);
  }
} else {
  for (let key in baseConfig.entry) {
    for (let j in baseConfig.entry[key]) {
      let fileName = baseConfig.entry[key][j];
      fileName && initFile(fileName, key);
    }
  }
}
