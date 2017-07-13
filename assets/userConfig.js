module.exports = {
  jsPath: "client/container",
  cssPath: "client/style",
  htmlPath: "client/html",
  alias: {
    "wsdc": "",  //组件路径
    "currentDir": process.cwd()
  }, // resolve alias
  projectName: "project",
  userName: "user",  //RTX用户名
  sprites: {
    spritesmith: {
      padding: 4
    },  //雪碧图间距
    retina: true,  //retina屏幕
    ratio: 3  //图片分倍率
  },
  postcss: false, //true or false
  pageConfig: "config/pageConfig.js"
}
