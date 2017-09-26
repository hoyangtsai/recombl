const path = require('path');
const fs = require('fs');
const homedir = require('node-homedir');

module.exports = {

  /**
   * get registryUrl by short name
   * @param {String} key - short name, support `china / npm / npmrc`, default to read from .npmrc
   * @return {String} registryUrl
   */
  getRegistryByType(key) {
    switch (key) {
      case 'tnpm':
        return 'http://r.tnpm.oa.com';
      case 'china':
        return 'https://registry.npm.taobao.org';
      case 'npm':
        return 'https://registry.npmjs.org';
      default:
        {
          if (/^https?:/.test(key)) {
            return key.replace(/\/$/, '');
          }
        // support .npmrc
          const home = homedir();
          let url = process.env.npm_registry || process.env.npm_config_registry || 'https://registry.cnpmjs.org';
          if (fs.existsSync(path.join(home, '.cnpmrc')) || fs.existsSync(path.join(home, '.tnpmrc'))) {
            url = 'https://r.tnpm.oa.com';
          }
          url = url.replace(/\/$/, '');
          return url;
        }
    }
  },
};
