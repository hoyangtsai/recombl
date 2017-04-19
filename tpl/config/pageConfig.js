module.exports = {
  path: "", //项目层级
  entry: ["index"], //页面文件列表
  commonsChunk: {
    name: null, //公共js、样式文件名，默认common
    minChunks: null //至少几个文件出现才抽取公共
  },
  sprites: {
    spritesmith: {
      padding: 4
    }, // 雪碧图间距
    retina: true, // retina屏幕
    ratio: 3 // 几倍图片资源
  }
}
