const path = require('path');

module.exports = function(baseConfig) {
  let entry = '{';
  let entryObj = {};

  // let webpackHotDevServer = path.join(process.env.MODULE_PATH, 'webpack/hot/dev-server');
  // if use react-hot
  let webpackHotDevServer = path.join(process.env.MODULE_PATH, 'webpack/hot/only-dev-server');
  let webpackDevServerClient = path.join(process.env.MODULE_PATH, 'webpack-dev-server/client');

  if (Array.isArray(baseConfig.entry)) {
    for (let i in baseConfig.entry) {
      if (i != 0) {
        entry += ',';
      }
      let name = baseConfig.entry[i];
      let page = path.join(process.cwd(), baseConfig.sourcePath, baseConfig.path, `${name}.js`);
      if (process.env.DEV) {
        entry += `"${name}": `;
        entry += `["${webpackHotDevServer}"`;
        entry += `, "${webpackDevServerClient}?http://localhost:${process.env.SERVER_PORT}"`;
        entry += `, "${page}"]`;
      } else {
        entry += `${name}: ["${page}"]`;
      }
    }
  } else {
    let j = 0;
    for (let key in baseConfig.entry) {
      for (let i in baseConfig.entry[key]) {
        // if (i != 0 || j != 0) {
        //   entry += ',';
        // }
        let name = baseConfig.entry[key][i];
        let page = path.join(process.cwd(), baseConfig.sourcePath, baseConfig.path, `${name}.js`);
        if (process.env.DEV) {
          // entry += `"${name}": `;
          // entry += `["${webpackHotDevServer}"`;
          // entry += `, "${webpackDevServerClient}?http://localhost:${process.env.SERVER_PORT}"`;
          // entry += `, "${page}"]`;
          entryObj[name] = [
            webpackHotDevServer,
            `${webpackDevServerClient}?http://localhost:${process.env.SERVER_PORT}`,
            page
          ];
        } else {
          // entry += `"${name}": ["${page}"]`;
          entryObj[name] = [page];
        }
      }
      j++;
    }
  }
  // entry += '}';
  // entry = entry.replace(/\\/g, '/');  //fix windows path issue
  // return JSON.parse(entry);
  return entryObj;
}
