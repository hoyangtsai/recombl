fs = require('fs');
pathFn = require('path');
React = require('react');
ReactDOM = require('react-dom');
ReactDOMServer = require('react-dom/server');

if (typeof window === 'undefined') {
  global.window = {};
}

global.document = {
  querySelector: function(x) { return x; },
  getElementById: function(x) { return '#' + x; },
  getElementsByTagName: function() { return [] }
};

let userConfig = require(pathFn.join(process.env.PWD, 'userConfig.js'));
let pageConfig = require(pathFn.join(process.env.PWD, userConfig.pageConfig));
let baseConfig = Object.assign({}, userConfig, pageConfig);

function reactDOMRender(fileName) {
  ReactDOM.render = (dom, place) => {
    let reg;
    if (place.indexOf(".") >= 0) {
      let str = place.slice((place.indexOf(".") + 1));
      reg = new RegExp("<.+class=.+" + str + "[^<]+>", "i");
    } else if (place.indexOf("#") >= 0) {
      let str = place.slice((place.indexOf("#") + 1));
      reg = new RegExp("<.+id=.+" + str + "[^<]+>", "i");
    }

    let htmlPath = pathFn.join(process.env.PWD,
      baseConfig.htmlPath, baseConfig.path, `${fileName}.html`);

    let html = ReactDOMServer.renderToStaticMarkup(dom);
    let fileHtml = String(fs.readFileSync(htmlPath))
      .replace(reg, match => { return match + html });

    let distHtmlPath = pathFn.join(process.env.PWD,
      process.env.DEV_DIR, baseConfig.path, `${fileName}.jade`);

    fs.writeFileSync(distHtmlPath, fileHtml);
  }
  try {
    let page = pathFn.join(process.env.PWD,
      process.env.DEV_DIR, 'ssr', baseConfig.path, `${fileName}.js`);
    require(page);
  } catch (err) {
    throw err;
  }
}

if (Array.isArray(baseConfig.entry)) {
  baseConfig.entry.map((page) => {
    reactDOMRender(page);
  });
} else if (baseConfig.entry.constructor === Object) {
  Object.keys(baseConfig.entry).map(key => {
    baseConfig.entry[key].map(page => {
      reactDOMRender(page);
    })
  })
}
