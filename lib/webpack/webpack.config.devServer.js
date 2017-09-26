const pathFn = require('path');
const entryMap = require('../helper/entryMap');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function(baseConfig) {
  let styLoader = [
    {
      loader: 'cache-loader',
      options: {
        cacheDirectory: pathFn.resolve(process.env.PWD, '.cache')
      }
    },
    'style-loader',
    {
      loader: 'css-loader',
      options: {
        importLoaders: 1
      }
    }
  ];

  if (baseConfig.postcss) {
    let packageJson = require(pathFn.join(process.cwd(), 'package.json'));
    let browsers = packageJson.browserslist ||
      ['last 4 versions', 'Android >= 4.0', 'Chrome >= 37', 'iOS>=7'];

    styLoader.push({
      loader: 'postcss-loader', options: {
        plugins: (loader) => [
          require('autoprefixer')({ browsers }),
          require('postcss-flexbugs-fixes'),
          require('postcss-gradientfixer')
        ]
      }
    })
  }
  styLoader.push('sass-loader');

  let devDir = baseConfig.devDirectory || '_tmp';

  let plugins = [];

  let projHtmlTplPath = pathFn.join(process.cwd(), 'template/html.dev.ejs');
  let libHtmlTplPath = pathFn.join(__dirname, '../../resources/template/html.dev.ejs');

  let htmlTempl = fs.existsSync(projHtmlTplPath) ? projHtmlTplPath : libHtmlTplPath;

  if (Array.isArray(baseConfig.entry)) {
    baseConfig.entry.map(page => {
      plugins.push(new HtmlWebpackPlugin({
          inject: true,
          chunks: [page],
          template: htmlTempl,
          filename: `${page}.html`,
          title: page,
          reactjs: '/_tmp/react.js'
        })
      );
    })
  } else {
    Object.keys(baseConfig.entry).map(key => {
      baseConfig.entry[key].map(page => {
        plugins.push(new HtmlWebpackPlugin({
            inject: true,
            chunks: [page],
            template: htmlTempl,
            filename: `${page}.html`,
            title: page,
            reactjs: '/_tmp/react.js'
          })
        )
      })
    })
  }

  return {
    entry: entryMap(baseConfig),
    output: {
      publicPath: `http://localhost:${process.env.SERVER_PORT}/${devDir}/`
    },
    module: {
      rules:[
        {
          test: /\.scss$/,
          use: styLoader
        }
      ]
    },
    plugins: plugins,
    devtool: 'eval'
  }
}
