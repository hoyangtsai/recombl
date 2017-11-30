module.exports = (env, options = {}) => ({
  cacheDirectory: '.cache',
  presets: [
    [require.resolve('babel-preset-env'), {
      "targets": {
        "browsers": ["last 2 versions", "safari >= 7"]
      },
      "useBuiltIns": true,
    }],
    require.resolve('babel-preset-react')
  ],
  plugins: [],
  env: {
    development: {
      presets: [ require.resolve('babel-preset-react-hmre') ],
      plugins: [ require.resolve('react-hot-loader/babel') ]
    },
    production: {
      compact: false,
      comments: false,
      plugins: [
        require.resolve('babel-plugin-transform-runtime')
      ]
    }
  }
});
