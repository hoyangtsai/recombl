require('babel-core/register');

import webpack from 'webpack';
import path from 'path';
import CommonsChunkPlugin from 'webpack/lib/optimize/CommonsChunkPlugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import OpenBrowserPlugin from 'open-browser-webpack-plugin';

const argv = require('minimist')(process.argv.slice(2));
const extractCSS = new ExtractTextPlugin('[name].css');

const port = process.env.PORT || 6001;

const postcssLoaderPlugin = [
  require('autoprefixer')({browsers:["last 4 versions", "Android >= 4.0", "Chrome >= 37", "iOS>=7"]}),//css前缀配置
  require('postcss-flexbugs-fixes'),
  require('postcss-gradientfixer')
];

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
        entry += `["./src/container${baseConfig.samePath}/${name}.js"`;
        entry += `, "webpack-hot-middleware/client?path=http://localhost:${port}/__webpack_hmr"]`;
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
            modulesDirectories: ["web_loaders", "web_modules", "node_loaders", baseConfig.projectPath+"/node_modules"]
        }
    }
}

var webpackConfig = function(baseConfig) {
    var entryObj = getEntry(baseConfig);
    var sameConfig = getSameConfig(baseConfig);

    var pluginsObj = [];
    if (baseConfig.fileName && baseConfig.fileName.length > 1 && !!baseConfig.commonsChunk) {
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

var serverWebpackConfig = function(baseConfig) {
    var entryObj = getEntry(baseConfig);
    var sameConfig = getSameConfig(baseConfig);
    var serverPlugins = [];
    var port = argv.port || 8080;
    if (argv.openbrowser) {
        serverPlugins.push(new OpenBrowserPlugin({ url: 'http://localhost:'+port+'/src/html'+baseConfig.samePath }));
    }

    return Object.assign({
        entry: entryObj,
        output: {
            path: path.resolve(process.cwd(), './dist', baseConfig.samePath),
            publicPath: '/',
            filename: './dist'+baseConfig.samePath+'/[name].js'
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

// console.log('__dirname : ', __dirname)
// console.log('process.cwd() : ', process.cwd())

// module.exports.outHtmlUse = outHtmlConfig;

// module.exports.use = argv.dev ? serverWebpackConfig : webpackConfig;
module.exports.use = serverWebpackConfig;

// module.exports.outCssUse = outCssConfig;
// module.exports.outJsUse = outJsConfig;
