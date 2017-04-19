const userConfig = require(path.join(process.cwd(), 'userConfig.js'));
const pageConfig = require(path.join(process.cwd(), userConfig.pageConfig));
const baseConfig = Object.assign(userConfig, pageConfig);

const generateTpl = require('./generateTpl.js');

if (Array.isArray(baseConfig.entry)) {
  for (let i in baseConfig.entry) {
    let fileName = baseConfig.entry[i];
    fileName && generateTpl(process.cwd(), baseConfig, fileName);
  }
} else {
  for (let key in baseConfig.entry) {
    for (let j in baseConfig.entry[key]) {
      let fileName = baseConfig.entry[key][j];
      fileName && generateTpl(process.cwd(), baseConfig, fileName, key);
    }
  }
}
