require('babel-register');

import webpack from 'webpack';
import path from 'path';
import CommonsChunkPlugin from 'webpack/lib/optimize/CommonsChunkPlugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import OpenBrowserPlugin from 'open-browser-webpack-plugin';

const argv = require('minimist')(process.argv.slice(2));
const extractCSS = new ExtractTextPlugin('[name].css');

const PORT = argv.port || argv.p || 6001;
const DEV = argv['watch'] || argv['w'] || argv['dev'] || argv['_'].includes('dev');

const postcssLoaderPlugin = [
  require('autoprefixer')({browsers:["last 4 versions", "Android >= 4.0", "Chrome >= 37", "iOS>=7"]}),//css前缀配置
  require('postcss-flexbugs-fixes'),
  require('postcss-gradientfixer')
];

const moduleDir = path.resolve(__dirname, '../node_modules');
const projDir = process.cwd();

function removeArrayValue(arr, val) {
  let index = -1;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] == val) {
      index = i;
      break;
    }
  }
  if (index == -1) {
    return;
  }
  arr.splice(index, 1);
}

function getEntry(baseConfig) {
  let entry = '{';
  if (Array.isArray(baseConfig.fileName)) {
    for (i in baseConfig.fileName) {
      if (i != 0) {
        entry += ',';
      }
      let name = baseConfig.fileName[i];
      entry += '"' + name + '":"./src/container'+baseConfig.samePath+'/'+name+'.js"';
    }
  } else {
    let j = 0;
    for (let key in baseConfig.fileName) {

      for (let i in baseConfig.fileName[key]) {
        if (i != 0 || j != 0) {
          entry += ',';
        }
        let name = baseConfig.fileName[key][i];
        entry += `"${name}": `;
        entry += `["${projDir}/src/container${baseConfig.samePath}/${name}.js"`;
        entry += `, "${moduleDir}/webpack-hot-middleware/client?path=http://localhost:${PORT}/__webpack_hmr"]`;
      }

      j++;
    }
  }
  entry += '}';
  return JSON.parse(entry);
}

function getSameConfig(baseConfig) {
  return {
    externals: {
      'react': 'React',
      'react-dom': 'ReactDOM'
    },
    resolve: {
      extensions: ['', '.js', '.jsx'],
      alias: {
        'react-guide': baseConfig.componentPath,
        'qqbrowser': baseConfig.projectPath
      }
    },
    resolveLoader: {
      modulesDirectories: [
        `${projDir}/web_loaders`, `${projDir}/web_modules`,
        `${projDir}/node_loaders`, `${moduleDir}`
      ]
    }
  }
}

const serverWebpackConfig = function(baseConfig) {
  let entryObj = getEntry(baseConfig);
  let sameConfig = getSameConfig(baseConfig);
  let serverPlugins = [
    new webpack.HotModuleReplacementPlugin()
  ];
  if (argv.openbrowser) {
    serverPlugins.push(new OpenBrowserPlugin({ url: 'http://localhost:'+PORT+'/src/html'+baseConfig.samePath }));
  }

  let outputPath = path.resolve(projDir, './dist', baseConfig.samePath);
  return Object.assign({
    entry: entryObj,
    output: {
      path: outputPath,
      // path: '/',
      publicPath: `http://localhost:${PORT}`,
      // publicPath: '/',
      filename: `${outputPath}/[name].js`
    },
    module: {
      loaders:[
        {
          test: /\.jsx?$/,
          exclude: /node_modules|dist/,
          loaders: ['react-hot', 'babel?presets=react-hmre']
        },
        {
          test: /\.scss$/,
          loader: 'style!css!postcss!sass'
        },
        {
          test: /\.(jpe?g|png|gif|svg|ttf|eot|woff2?)(\?.*)?$/,
          loader: 'myapp-file-loader',
          query: {
            queryname: 1,
            name: '[path][name].[ext]'
          }
        }
      ]
    },
    postcss: postcssLoaderPlugin,
    plugins: serverPlugins
  }, sameConfig);
}

const webpackConfig = function(baseConfig) {
  let entryObj = getEntry(baseConfig);
  let sameConfig = getSameConfig(baseConfig);

  let pluginsObj = [];
  if (baseConfig.fileName && baseConfig.fileName.length > 1 && !!baseConfig.commonsChunk) {
    let comName = (baseConfig.commonsChunk && baseConfig.commonsChunk.name) || 'common';
    let chunkObj = {
      name: comName,
      filename: comName + '.js'
    };
    if (baseConfig.commonsChunk && baseConfig.commonsChunk.minChunks) {
      chunkObj.minChunks = baseConfig.commonsChunk.minChunks;
    }
    if (baseConfig.commonsChunk.excludeFile && baseConfig.commonsChunk.excludeFile.length > 0) {
      chunkObj.chunks = baseConfig.fileName.slice();
      for (let j in baseConfig.commonsChunk.excludeFile) {
        removeArrayValue(chunkObj.chunks, baseConfig.commonsChunk.excludeFile[j]);
      }
    }
    pluginsObj.push(new CommonsChunkPlugin(chunkObj));
  }
  pluginsObj.push(extractCSS);

  return Object.assign({
    stats: {
      // minimal logging
      assets: true,
      colors: true,
      version: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      children: false
    },
    entry: entryObj,
    output: {
      path: path.resolve(projDir, './dist', baseConfig.samePath),
      publicPath: '/',
      filename: '[name].js'
    },
    module: {
      loaders:[
        {
          test: /\.jsx?$/,
          exclude: /node_modules|dist/,
          loader: 'babel',
          query: {
            "cacheDirectory": true,
            "compact": false,
            "comments": false,
            "plugins": [
              "transform-runtime"
            ]
          }
        },
        {
          test: /\.scss$/,
          loader: extractCSS.extract(['css','postcss','sass'])
        },
        {
          test: /\.(jpe?g|png|gif|svg|ttf|eot|woff2?)(\?.*)?$/,
          loader: 'myapp-file-loader',
          query: {
            queryname: 1,
            name: '[path][name].[ext]'
          }
        }
      ]
    },
    postcss: postcssLoaderPlugin,
    plugins: pluginsObj
  }, sameConfig);
}

var outCssConfig = function(baseConfig) {
    var pageLength = 0;
    var entry = '{';
    if (isArray(baseConfig.fileName)) {
        return null;
    } else {
        for (let key in baseConfig.fileName) {
            if (pageLength != 0) {
                entry += ',';
            }
            entry += '"' + key + '":"./src/container'+baseConfig.samePath+'/'+key+'.jsx"';
            pageLength++;
        }
    }
    entry += '}';
    var entryObj = JSON.parse(entry);
    var sameConfig = getSameConfig(baseConfig);

    var pluginsObj = [];
    if (baseConfig.fileName && pageLength > 1 && !!baseConfig.commonsChunk) {
        var comName = (baseConfig.commonsChunk && baseConfig.commonsChunk.name) || 'common';
        var chunkObj = {
            name: comName,
            filename: comName + '.js'
        };
        if (baseConfig.commonsChunk && baseConfig.commonsChunk.minChunks) {
            chunkObj.minChunks = baseConfig.commonsChunk.minChunks;
        }
        if (baseConfig.commonsChunk.excludeFile && baseConfig.commonsChunk.excludeFile.length > 0) {
            chunkObj.chunks = baseConfig.fileName.slice();
            for (var j in baseConfig.commonsChunk.excludeFile) {
                removeArrayValue(chunkObj.chunks, baseConfig.commonsChunk.excludeFile[j]);
            }
        }
        pluginsObj.push(new CommonsChunkPlugin(chunkObj));
    }
    pluginsObj.push(extractCSS);

    return Object.assign({
        stats: {
            // minimal logging
            assets: true,
            colors: true,
            version: true,
            hash: false,
            timings: true,
            chunks: false,
            chunkModules: false,
            children: false
        },
        entry: entryObj,
        output: {
            path: path.resolve(__dirname, './dist', baseConfig.samePath),
            publicPath: './',
            filename: '[name].js'
        },
        module: {
            loaders:[
                {
                    test: /\.jsx?$/,
                    exclude: /node_modules|dist/,
                    loader: 'babel',
                    query: {
                        "cacheDirectory": true,
                        "compact": false,
                        "comments": false,
                        "plugins": [
                            "transform-runtime"
                        ]
                    }
                },
                {
                    test: /\.scss$/,
                    loader: extractCSS.extract(['css','postcss','sass'])
                },
                {
                    test: /\.(jpe?g|png|gif|svg|ttf|eot|woff2?)(\?.*)?$/,
                    loader: 'myapp-file-loader',
                    query: {
                        queryname: 1,
                        name: '[path][name].[ext]'
                    }
                }
            ]
        },
        postcss: postcssLoaderPlugin,
        plugins: pluginsObj
    }, sameConfig);
}

var outJsConfig = function(baseConfig) {
    var entryObj = getEntry(baseConfig);
    var sameConfig = getSameConfig(baseConfig);

    var pageLength = 0;
    for (let key in baseConfig.fileName) {
        pageLength++;
    }
    var pluginsObj = [];
    if (baseConfig.fileName && pageLength > 1 && !!baseConfig.commonsChunk) {
        var comName = (baseConfig.commonsChunk && baseConfig.commonsChunk.name) || 'common';
        var chunkObj = {
            name: comName,
            filename: comName + '.js'
        };
        if (baseConfig.commonsChunk && baseConfig.commonsChunk.minChunks) {
            chunkObj.minChunks = baseConfig.commonsChunk.minChunks;
        }
        if (baseConfig.commonsChunk.excludeFile && baseConfig.commonsChunk.excludeFile.length > 0) {
            chunkObj.chunks = baseConfig.fileName.slice();
            for (var j in baseConfig.commonsChunk.excludeFile) {
                removeArrayValue(chunkObj.chunks, baseConfig.commonsChunk.excludeFile[j]);
            }
        }
        pluginsObj.push(new CommonsChunkPlugin(chunkObj));
    }

    return Object.assign({
        stats: {
            // minimal logging
            assets: true,
            colors: true,
            version: true,
            hash: false,
            timings: true,
            chunks: false,
            chunkModules: false,
            children: false
        },
        entry: entryObj,
        output: {
            path: path.resolve(__dirname, './dist', baseConfig.samePath),
            publicPath: './',
            filename: '[name].js'
        },
        module: {
            loaders:[
                {
                    test: /\.jsx?$/,
                    exclude: /node_modules|dist/,
                    loader: 'babel',
                    query: {
                        "cacheDirectory": true,
                        "compact": false,
                        "comments": false,
                        "plugins": [
                            "transform-runtime"
                        ]
                    }
                },
                {
                    test: /\.scss$/,
                    loader: 'css!sass'
                },
                {
                    test: /\.(jpe?g|png|gif|svg|ttf|eot|woff2?)(\?.*)?$/,
                    loader: 'myapp-file-loader',
                    query: {
                        queryname: 1,
                        name: '[path][name].[ext]'
                    }
                }
            ]
        },
        plugins: pluginsObj
    }, sameConfig);
}

var outHtmlConfig = function(baseConfig) {
    var entryObj = getEntry(baseConfig);
    var sameConfig = getSameConfig(baseConfig);

    return Object.assign({
        entry: entryObj,
        output: {
            path: path.resolve(__dirname, './dist', baseConfig.samePath),
            publicPath: './',
            filename: '[name].js'
        },
        module: {
            loaders:[
                {
                    test: /\.jsx?$/,
                    exclude: /node_modules|dist/,
                    loader: 'babel',
                    query: {
                        "cacheDirectory": true,
                        "compact": false,
                        "comments": false,
                        "plugins": [
                            "transform-runtime"
                        ]
                    }
                },
                {
                    test: /\.scss$/,
                    loader: "css!sass"
                },
                {
                    test: /\.(jpe?g|png|gif|svg|ttf|eot|woff2?)(\?.*)?$/,
                    loader: 'myapp-file-loader',
                    query: {
                        queryname: 1,
                        name: '[path][name].[ext]'
                    }
                }
            ]
        }
    }, sameConfig);
}

// module.exports.outHtmlUse = outHtmlConfig;

module.exports.use = DEV ? serverWebpackConfig : webpackConfig;

// module.exports.outCssUse = outCssConfig;
// module.exports.outJsUse = outJsConfig;
