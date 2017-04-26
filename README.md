## React Component Builder

<a name="init"></a>
### 初始化
```bash
reco init
```
初始化项目文件夹，包含基本配置文件

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


Config 配置文件



<a name="Development"></a>
### Development

```bash
reco -w
```

参数
-w, -watch, dev
  启用 webpack-dev-server ，监听项目文件夹 `client/container` 下源码进行实时编译
-p
  本地运行端口
-open
  webpack 编译完成后，自动开启浏览器预览
