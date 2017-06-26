const path = require('path');

module.exports = function(baseConfig) {
  let config = {
    context:process.env.PWD,

    output: {
      filename: '[name].js',
    },

    externals: {
      'react': 'React',
      'react-dom': 'ReactDOM'
    },

    resolve: {
      extensions: [".js", ".json", ".jsx"],
      alias: baseConfig.alias,
      modules: ['node_modules', process.env.MODULE_PATH, path.join(process.env.PWD, 'node_modules')]
    },

    resolveLoader: {
      modules: ['node_modules', process.env.MODULE_PATH, path.join(process.env.PWD, 'node_modules')]
    }
  };

  return config;
}
