const path = require('path');

module.exports = function(baseConfig) {
  let entryObj = {};

  // let webpackHotDevServer = path.join(process.env.MODULE_PATH, 'webpack/hot/dev-server');
  // if use react-hot
  let webpackHotDevServer = path.join(process.env.MODULE_PATH, 'webpack/hot/only-dev-server');
  let webpackDevServerClient = path.join(process.env.MODULE_PATH, 'webpack-dev-server/client');

  let getEntryMap = function(obj, name) {
    let page = path.join(process.cwd(), baseConfig.jsPath, baseConfig.path, `${name}.js`);
    if (process.env.DEV) {
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
    for (let key in baseConfig.entry) {
      for (let i in baseConfig.entry[key]) {
        let fileName = baseConfig.entry[key][i];
        getEntryMap(entryObj, fileName);
      }
    }
  }
  return entryObj;
}
