module.exports = {
  jsPath: "client/container",
  cssPath: "client/style",
  htmlPath: "client/html",
  alias: {
    "{__component__}": "{__componentPath__}",
    "{__feature__}": "{__featurePath__}"
  }, // resolve alias
  projectName: "{__projectName__}",
  userName: "{__userName__}", // 用户名
  sprites: {
    spritesmith: {
      padding: 4
    }, // 雪碧图间距
    retina: true, // retina屏幕
    ratio: 2 // 几倍图片资源
  },
  postcss: {__postcss__}, // boolean or array
  pageConfig: "config/pageConfig"
}
