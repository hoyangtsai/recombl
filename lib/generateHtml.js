React = require('react');
ReactDOM = require('react-dom');
ReactDOMServer = require('react-dom/server');

path = require('path');
fs = require('fs');

global.document = {
  querySelector: function(x) { return x; },
  getElementById: function(x) { return '#' + x; },
  getElementsByTagName: function() { return [] }
};

const userConfig = require(path.join(process.cwd(), 'userConfig'));
const pageConfig = require(path.join(process.cwd(), userConfig.pageConfig));
const baseConfig = Object.assign(userConfig, pageConfig);

console.log(process.env);

function reactDOMRender(fileName) {
  ReactDOM.render = (dom, place) => {
    let reg;
    if (place.indexOf(".") >= 0) {
      let str = place.slice((place.indexOf(".") + 1));
      reg = new RegExp("<.+class=.+" + str + "[^<]+>", "i");
    } else if (place.indexOf("#") >= 0) {
      let str = place.slice((place.indexOf("#") + 1));
      reg = new RegExp("<.+id=.+" + str + "[^<]+>", "i");
    } else {
      console.log("Error: generateHtml.js out html error");
      return false;
    }
    let html = ReactDOMServer.renderToStaticMarkup(dom);
    let htmlPath = path.join(baseConfig.htmlPath, baseConfig.path, `/${fileName}.html`);
    let fileHtml = String(
      fs.readFileSync(htmlPath))
        .replace(reg, match => {
          return match + html
        });
    let distHtmlPath = path.join(process.cwd(), 'dist', baseConfig.path, `/${fileName}.jade`);
    fs.writeFileSync(distHtmlPath, fileHtml);
  };
  let page = path.join(process.cwd(), 'dist', baseConfig.path, `/${fileName}.js`);
  try {
    require(page);
  } catch (e) {
    console.error(`Error generateHtml fileName: "${page}"`);
    console.error(e.stack);
    process.exit();
  }
}

if (!Array.isArray(baseConfig.entry)) {
  for (let key in baseConfig.entry) {
    for (let i in baseConfig.entry[key]) {
      let fileName = baseConfig.entry[key][i];
      reactDOMRender(fileName);
    }
  }
} else {
  for (i in baseConfig.entry) {
    let fileName = baseConfig.entry[i];
    reactDOMRender(fileName);
  }
}
