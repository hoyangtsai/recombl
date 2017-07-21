module.exports = {
  jsPath: "client/container",
  cssPath: "client/style",
  htmlPath: "client/html",
  alias: {
    "wsdc": "",  //组件路径
    "currentDir": {__currentDir__}
  }, // resolve alias
  projectName: "{__projectName__}",
  userName: "{__userName__}",
  sprites: {
    spritesmith: {
      padding: 4
    },  //雪碧图间距
    retina: true,  //retina屏幕
    ratio: 3  //图片分倍率
  },
  browsersList: [
    'last 4 versions',
    'Android >= 4.0',
    'Chrome >= 37',
    'iOS>=7'
  ],
  postcss: {__postcss__}, //true or false
  pageConfig: "config/pageConfig.js",
  devDirectory: "_tmp"
}
