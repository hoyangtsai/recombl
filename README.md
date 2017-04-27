# React Component Builder

<a name="prerequisite"></a>
## 前置要求
安装 Node 环境，最低要求 node 6 LTS 版本。
[https://nodejs.org/en/download/](https://nodejs.org/en/download/)

<a name="init"></a>
## 安装
```bash
npm install -g recombl
```

<a name="init"></a>
## 初始化
在当前目录下，生成一个完整的项目文件夹，包含配置文件。
```bash
reco init
```
```
.
├── client
│   ├── container
│   │   └── index.js
│   ├── html
│   │   └── index.html
│   ├── image
│   ├── slice
│   └── style
│       └── index.scss
├── config
│   └── pageConfig.js
├── package.json
└── userConfig.js
```
### Config 配置文件
userConfig.js 用戶配置
```js
module.exports = {
  jsPath: "client/container",
  cssPath: "client/style",
  htmlPath: "client/html",
  alias: {
    "wsdc": "",  //组件路径
    "currentDir": process.cwd()
  }, // resolve alias
  projectName: "20170430-eventName",
  userName: "keithytsai",  //RTX用户名
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
```
* postcss 设置 `true`，使用 QQ浏览器 postcss 默认配置 (autoprefixer, postcss-flexbugs-fixes, postcss-gradientfixer)
* pageConfig 不同用户可指定不同页面配置


config/pageConfig.js 页面配置
```js
module.exports = {
  path: "",  //页面层级
  entry: ["index"], //页面文件列表 Array or Object
  commonsChunk: {
    name: null,  //公共js、样式文件名，默认common
    minChunks: null  //至少几个文件出现才抽取公共
  },
  sprites: {  //覆写 userConfg.js 雪碧图配置
    spritesmith: {
      padding: 4
    },
    retina: true,
    ratio: 3
  }
}
```
* path - 用来填入页面相对应的 html 和 style 路径，如果多人开发一个项目文件夾。不需要可以留空。
* entry - 填入 js 文件入口，通常一个 js 文件入口对应一个 html 文件，可以是 array 或 object。
```js
// array
entry: ['page1', 'page2', 'page3'];
// object
entry: {
  'page1': ['page1/sub-page-1', 'page1/sub-page-2', 'page-sub-page-3'],
  'page2': ['page2/sub-page-1', 'page2/sub-page-2']
}
```
* commonsChunk - name 为生成公用的 js 和 css 文件名，minChunks 为多少页面引同一个文件才生成共用文件。

<a name="development"></a>
## 开发模式
使用 webpack 和 webpack-dev-server 对源代码进行实时编译。
```bash
reco -w
OR
reco dev
```
#### API
-p
    选填，本地运行端口，默认6001<br/>
-open
    选填，编译完成后，自动开启浏览器进行预览<br/>

<a name="new"></a>
## 生成新模版
读取 pageConfg.js 中的 entry 生成新模版，其中包含 js, html 和 scss 文件。
```bash
reco new
```

<a name="publish"></a>
## 生成静态文件
将目前源文件打包成静态文件，生成至 publish 文件夹底下。
```bash
reco publish
OR
reco -pub
```
