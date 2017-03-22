// console.log(process.env);

module.exports = function(baseConfig) {
  return {
    output: {
      filename: '[name].js',
    },
    externals: {
      'react': 'React',
      'react-dom': 'ReactDOM'
    },
    resolve: {
      extensions: ['', '.js', '.jsx'],
      alias: baseConfig.component
    },
    resolveLoader: {
      // root: process.env.MODULE_PATH,
      modulesDirectories: ['web_loaders', 'web_modules', 'node_loaders', process.env.MODULE_PATH]
    }
  }
}
