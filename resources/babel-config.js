module.exports = (env, options = {}) => ({
  babelrc: false,
  presets: [
    require.resolve('babel-preset-es2015'),
    require.resolve('babel-preset-react'),
    require.resolve('babel-preset-stage-0'),
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
