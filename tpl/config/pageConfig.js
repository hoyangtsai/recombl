module.exports = {
  path: "",  //页面层级
  entry: ["index"], //页面文件列表 Array or Object
  commonsChunk: {
    name: null,  //公共js、样式文件名，默认common
    minChunks: 1  //至少几个文件出现才抽取公共
  },
  sprites: {  //覆写 userConfg.js 雪碧图配置
    spritesmith: {
      padding: 4
    },
    retina: true,
    ratio: 3
  },
  // external loaders for webpack
  extLoaders: [
    {
      test: /\.(jpe?g|png|gif|ttf|eot|woff2?)(\?.*)?$/,
      loader: require.resolve('myapp-file-loader'),
      query: {
        queryname: 1,
        name: '[path][name].[ext]'
      }
    },
    {
      test: /\.(svg)$/i,
      loader: require.resolve('svg-sprite-loader')
    }
  ]
}
