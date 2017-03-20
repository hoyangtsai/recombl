const path = require('path');
let config = {
    samePath: '', //项目层级
    fileName: {
        // 'store': ['store/store-index', 'store/category','store/category-redpackage','store/category-gift', 'store/rank', 'store/rank-detail', 'store/classify', 'store/classify1', 'store/classify-detail', 'store/classify-other', 'store/auther', 'store/gods', 'store/search', 'store/interactive-detail','store/recommand','store/error','store/alert','store/interesting'],
        // 'user': ['user/user','user/account','user/account-pop','user/balance','user/purchase-records','user/consumption-details','user/recharge-record','user/bean','user/sign','user/sign-pop','user/sign-web','user/sign-login'],
        'user': ['user/account'],
        // 'benefits': ['benefits/benefits','benefits/benefits-package','benefits/benefits-pop'],
        // 'comments': ['comment/all-comments','comment/all-comments-hasremark','comment/all-comments-null','comment/comment-edit','comment/comment-detail','comment/my-comment'],
        // 'circle': ['circle/circle','circle/circle-mine','circle/circle-rank','circle/circle-rank-detail'],
        // 'QA': ['QA/QA','QA/QA-vote','QA/QA-vote','QA/QA-disclaimer'],
        // 'call': ['call/call','call/call-panel'],
        // 'afterread': ['afterread/discuss','afterread/discuss-continue'],
        // 'booklist': ['booklist/booklist','booklist/booklist-detail','booklist/upload','booklist/my-booklist'],
        // 'discovery': ['discovery/discovery','discovery/book-club','discovery/book-club-detail'],
        // 'passage': ['passage/passage','passage/passage-pop','passage/passage-oppo'],
        // 'gift': ['gift/gift'],
        // 'act-170306-happyRead': ['act-170306-happyRead/index','act-170306-happyRead/detail','act-170306-happyRead/bought','act-170306-happyRead/bought-empty'],
        // 'topic-170310-jinpin': ['topic-170310-jinpin/index'],

        // 'common': ['common/common']
    }, //页面文件列表
    commonsChunk: {
        name: null, //公共js、样式文件名，默认common
        minChunks: 5 //至少几个文件出现才抽取公共
    }
}

config.projectPath = '/Users/Keithytsai/Develope/qb-xiaoshuo'; // 本地项目目录
// config.projectPath = '/Users/Zac/Developer/mxd/qb-xiaoshuo'; // 本地项目目录
config.componentPath = '/Users/Keithytsai/Develope/react-guide'; // 本地组件目录
// config.componentPath = '/Users/Zac/Developer/mxd/react-guide'; // 本地组件目录
config.projectName = 'react-xiaoshuo' // 上传目录

if (!config.img) {
  config.img = {
    spritesmith: {
      padding: 4
    }, // 雪碧图间距
    retina: true, // retina屏幕
    ratio: 3 // 几倍图片资源
  }
}

if (config.userName !== 'react-guide') {
  config.userName = 'minminma' // 用户名
}

// 提供给初始、gulp等使用
exports.baseConfig = config
// webpack
if (!(global.__ISGULPFILE__ || global.__NOWEBPACK__)) {
  const makeWebpackConfig = require(path.resolve(__dirname, './config'));
  exports.webpackConfig = makeWebpackConfig.use(config)
  // exports.outHtmlWebpackConfig = makeWebpackConfig.outHtmlUse(config)
  // exports.outCssWebpackConfig = makeWebpackConfig.outCssUse(config)
  // exports.outJsWebpackConfig = makeWebpackConfig.outJsUse(config)
}
