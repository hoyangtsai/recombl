const path = require('path');

const dirname = /(.*?)\/node_modules\/.*/.exec(__dirname.replace(/\\/g, '/')) === null ?
  __dirname : /(.*?)\/node_modules\/.*/.exec(__dirname.replace(/\\/g, '/'))[1];

module.exports = function(baseConfig) {
  let entryObj = {};

  let getEntryMap = function(obj, name) {
    let page = path.join(process.cwd(), baseConfig.jsPath, baseConfig.path, `${name}.js`);
    if (process.env.NODE_ENV === 'development') {
      // due to react-hot, webpack/hot/dev-server changed to webpack/hot/only-dev-server
      let webpackHotDevServer = dirname === process.env.PWD.replace(/\\/g, '/') ?
        'webpack/hot/only-dev-server' :
          path.join(process.env.MODULE_PATH, 'webpack/hot/only-dev-server');
      let webpackDevServerClient = dirname === process.env.PWD.replace(/\\/g, '/') ?
        'webpack-dev-server/client' :
          path.join(process.env.MODULE_PATH, 'webpack-dev-server/client');

      entryObj[name] = [
        webpackHotDevServer,
        `${webpackDevServerClient}?http://localhost:${process.env.SERVER_PORT}`,
        page
      ];
    } else {
      entryObj[name] = [page];
    }
  };

  if (Array.isArray(baseConfig.entry)) {
    for (let i in baseConfig.entry) {
      let fileName = baseConfig.entry[i];
      getEntryMap(entryObj, fileName);
    }
  } else {
    let j = 0;
    for (let key in baseConfig.entry) {
      for (let i in baseConfig.entry[key]) {
        let fileName = baseConfig.entry[key][i];
        getEntryMap(entryObj, fileName);
      }
      j++;
    }
  }
  return entryObj;
}
