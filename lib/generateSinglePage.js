const fs = require('fs');
const path = require('path');

const userConfig = require(path.join(process.cwd(), 'userConfig'));
const pageConfig = require(path.join(process.cwd(), userConfig.pageConfig));
const baseConfig = Object.assign(userConfig, pageConfig);

if (!Array.isArray(baseConfig.entry)) {
  for (let key in baseConfig.entry) {
    let fileName = key;
    let fileList = baseConfig.entry[key];
    try {
      let page = path.join(process.cwd(), baseConfig.jsPath, baseConfig.path, fileName);
      let exists = fs.existsSync(`${page}.jsx`);
      if (exists) {
        let strJsx = String(fs.readFileSync(`${page}.jsx`));
        if (strJsx.indexOf('/**generated temporary file**/') >= 0) {
          console.error(`Error generateSinglePage: ${page}.jsx 已存在。\r\n请确认是否为临时生成文件。如果不是，需要重命名；如果是，请删除。`);
        }
      }
      let pageStr = `/**generated temporary file**/\r\n`;
      for (let i in fileList) {
        let part = path.join('qqbrowser', baseConfig.jsPath, baseConfig.path, fileList[i]);
        pageStr += `import "${part}.js"\r\n`;
      }
      fs.writeFileSync(`${page}.jsx`, pageStr);
    } catch (e) {
      console.error(`Error generateSinglePage fileName: ${e}`);
    }
  }
}
