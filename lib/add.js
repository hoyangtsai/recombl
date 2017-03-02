import fs from 'fs';
import path from 'path';
// var config = require('../config/ignore/index.js').baseConfig;

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

//判断是否是数组
function isArray(o) {
  return Object.prototype.toString.call(o) == '[object Array]';
}

var getLayerPath = (str) => {
  if (!str) {
    str = "/"; //解决QQ浏览器项目samePath为空的情况
  }
  let arr = str.split("/"),
      layerPath = "";
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

let cssLayer = getLayerPath(config.samePath),
    jsLayer = cssLayer + "../";

function initFile(fileName, cssName) {
  let cssName = cssName || fileName;
  let filePath = config.samePath,
      arrFolder = fileName.split("/"),
      fileCssLayer = cssLayer,
      fileJsLayer = jsLayer;
  for (let i = 0, j = arrFolder.length; i < j - 1; i++) {
    if (!!arrFolder[i]) {
      filePath += "/" + arrFolder[i];
      fileCssLayer += "../";
      fileJsLayer += "../";
    }
  }
  try {
    let exists = fs.existsSync('./html' + config.samePath + '/' + fileName + '.html');
    if (exists) {
      console.log(fileName + '.html已存在');
    } else {
      let fileHtml = htmlTpl.replace(/\{__htmlTitle__\}/g, (match) => {
        return fileName + '_myapp';
      });
      fileHtml = fileHtml.replace(/\{__samePath__\}/g, (match) => {
        return config.samePath;
      });
      fileHtml = fileHtml.replace(/\{__cssName__\}/g, (match) => {
        return cssName;
      });
      fileHtml = fileHtml.replace(/\{__jsName__\}/g, (match) => {
        return fileName;
      });
      fileHtml = fileHtml.replace(/\{__cssLayer__\}/g, (match) => {
        return fileCssLayer;
      });
      fileHtml = fileHtml.replace(/\{__jsLayer__\}/g, (match) => {
        return fileJsLayer;
      });
      funMkdirSync('./html' + filePath);
      fs.writeFileSync('./html' + config.samePath + '/' + fileName + '.html', fileHtml);
      console.log(fileName + '.html正常生成');
    }
  } catch (e) {
    console.log('Error fileHtml:' + e);
  }
  try {
    let exists = fs.existsSync('./project' + config.samePath + '/' + fileName + '.js');
    if (exists) {
      console.log(fileName + '.js已存在');
    } else {
      let fileJs = jsTpl.replace(/\{__samePath__\}/g, (match) => {
        return config.samePath;
      });
      fileJs = fileJs.replace(/\{__scssName__\}/g, (match) => {
        return fileName;
      });
      funMkdirSync('./project' + filePath);
      fs.writeFileSync('./project' + config.samePath + '/' + fileName + '.js', fileJs);
      console.log(fileName + '.js正常生成');
    }
  } catch (e) {
    console.log('Error fileJs:' + e);
  }
  try {
    let exists = fs.existsSync('./scss' + config.samePath + '/' + fileName + '.scss');
    if (exists) {
      console.log(fileName + '.scss已存在');
    } else {
      funMkdirSync('./scss' + filePath);
      fs.writeFileSync('./scss' + config.samePath + '/' + fileName + '.scss', scssTpl);
      console.log(fileName + '.scss正常生成');
    }
  } catch (e) {
    console.log('Error fileSass:' + e);
  }
}


let htmlTpl = String(fs.readFileSync('../tpl/html.tpl'));
let jsTpl = String(fs.readFileSync('../tpl/js.tpl'));
let scssTpl = String(fs.readFileSync('../tpl/scss.tpl'));

for (let i in config.fileName) {
  let fileName = config.fileName[i];
  fileName && initFile(fileName);
}
