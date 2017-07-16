const pathFn = require('path');

const dirname = /(.*?)\/node_modules\/.*/.exec(__dirname.replace(/\\/g, '/')) === null ?
  __dirname : /(.*?)\/node_modules\/.*/.exec(__dirname.replace(/\\/g, '/'))[1];

function getEntryMap(obj, name, absPath) {
  if (process.env.NODE_ENV === 'development') {
    // due to react-hot, webpack/hot/dev-server changed to webpack/hot/only-dev-server
    let webpackHotDevServer = dirname === process.env.PWD.replace(/\\/g, '/') ?
      'webpack/hot/only-dev-server' :
        pathFn.join(process.env.MODULE_PATH, 'webpack/hot/only-dev-server');
    let webpackDevServerClient = dirname === process.env.PWD.replace(/\\/g, '/') ?
      'webpack-dev-server/client' :
        pathFn.join(process.env.MODULE_PATH, 'webpack-dev-server/client');

    obj[name] = [
      webpackHotDevServer,
      `${webpackDevServerClient}?http://localhost:${process.env.SERVER_PORT}`,
      absPath
    ];
  } else {
    obj[name] = [absPath];
  }
}

module.exports = function(baseConfig) {
  let entryObj = {};

  if (Array.isArray(baseConfig.entry)) {
    for (let i in baseConfig.entry) {
      let fileName = baseConfig.entry[i];
      let absPath = pathFn.join(process.env.PWD,
        baseConfig.jsPath, baseConfig.path, `${fileName}.js`);
      getEntryMap(entryObj, fileName, absPath);
    }
  } else {
    let j = 0;
    for (let key in baseConfig.entry) {
      for (let i in baseConfig.entry[key]) {
        let fileName = baseConfig.entry[key][i];
        let absPath = pathFn.join(process.env.PWD,
          baseConfig.jsPath, baseConfig.path, `${fileName}.js`);
        getEntryMap(entryObj, fileName, absPath);
      }
      j++;
    }
  }
  return entryObj;
}
