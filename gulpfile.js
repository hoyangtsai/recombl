const gulp = require('gulp');
const uglify = require('gulp-uglify');
const postcss = require('gulp-postcss');
const sprites = require('postcss-sprites').default;
const replace = require('gulp-replace');
const rename = require('gulp-rename');
const prettify = require('gulp-jsbeautifier');
const base64 = require('gulp-base64');
const zip = require('gulp-zip');
const upload = require('gulp-file-post');
const del = require('del');
const cssnano = require('gulp-cssnano');
const fs = require('fs');
const path = require('path');
const request = require('request');
const querystring = require('querystring');
const gcmq = require('gulp-group-css-media-queries');
const argv = require('optimist').argv;

const userConfig = require(path.join(process.env.PWD, 'userConfig'));
const pageConfig = require(path.join(process.env.PWD, userConfig.pageConfig));
const baseConfig = Object.assign({}, userConfig, pageConfig);

function getLayerPath(str) {
  if (!str) {
    str = "/";//解决QQ浏览器项目samePath为空的情况
  }
  let arr = str.split("/"), layerPath = "";
  let layer = arr.length;
  if (!arr[0]) {
    --layer;
  }
  if (!arr[arr.length-1]) {
    --layer;
  }
  ++layer;
  for(;layer > 0;layer--) {
    layerPath += "../";
  }
  return layerPath;
}

let componentResourcePath;//组件资源在dist的目录
//雪碧图 图片base64
gulp.task('css_img', function (done) {
  let opts = {
    stylesheetPath: path.join(process.env.PWD, process.env.PUBLISH_DIR, 'css'),
    spritePath: path.join(process.env.PWD, process.env.PUBLISH_DIR, 'image', baseConfig.path) + '/',
    spritesmith: baseConfig.sprites.spritesmith,
    retina:  baseConfig.sprites.retina,
    hooks: false,
    filterBy: function(image) {//只合并sprite目录下的图片
      if (image.url.indexOf('.__sprite') === -1) {
        return Promise.reject();
      }
      return Promise.resolve();
    },
    groupBy: function (image) {
      //将图片分组，可以实现按照文件夹生成雪碧图
      return spritesGroupBy(image);
    }
  };

  let spritesGroupBy = function(image) {
    let groupName = 'x';
    let groups = /\.__sprite.*/gi.exec(image.url);
    let arrName = groups[0].split('__'), arrNameLen = arrName.length;
    if (arrNameLen >= 3) {
      groupName = arrName[2].split(".")[0];
    }
    image.retina = baseConfig.sprites.retina;
    image.ratio = baseConfig.sprites.ratio;
    return Promise.resolve(groupName);
  }

  let layerPath = getLayerPath(baseConfig.path);

  if (!Array.isArray(baseConfig.entry)) {
    let delFileList = [];
    for (let key in baseConfig.entry) {
      delFileList.push(path.join(process.env.PWD, process.env.DEV_DIR, `${baseConfig.path}`, `${key}.js`));
      delFileList.push(path.join(process.env.PWD, baseConfig.jsPath, baseConfig.path, `${key}.js`));
    }
    del.sync(delFileList, { force: true });
  }

  return gulp.src(path.join(process.env.PWD, process.env.DEV_DIR, baseConfig.path, '*.css'))
      .pipe(postcss([sprites(opts)]))//合并雪碧图
      .pipe(base64({//图片base64
        extensions: [/\.__inline\.png$/i, /\.__inline\.svg$/i, /\.__inline\.jpe?g$/i, /\.__inline\.ttf$/i],
        deleteAfterEncoding: false,
        maxImageSize: 100*1024,
        debug: false
      }))
      .pipe(replace(/url\([^_:\n\r]+\/image\//gi, function(match) {
          let str = match.toLowerCase();
          if (str.indexOf('url(//') > -1) {
            return match;
          }
          return 'url('+layerPath+'image/';
      }))//更正图片路径
      .pipe(replace(/url\([^_:\)\n\r]+\/font\//gi, function(match) {
          var str = match.toLowerCase();
          if (str.indexOf('url(//') > -1) {
            return match;
          }
          return 'url('+layerPath+'font/';
      }))
      //更正字体路径
      // .pipe(replace(/url\(.+\/_.*\/react-guide\//g, function(match) {
      //     componentResourcePath = match;
      //     return 'url('+layerPath+'asset/';
      // })) //更正组件资源路径
      .pipe(rename(function (path) {//把.js.css的css重命名
        path.dirname = "";
        if (path.basename.indexOf(".js") > -1) {
          let arrName = path.basename.split(".js");
          path.basename = arrName[0];
        }
        path.extname = ".css";
        return path;
      }))
      // .pipe(gcmq())
      .pipe(cssnano({
        discardUnused: false,
        reduceIdents: false,
        mergeIdents: false,
        zindex: false,
        core: argv.compress || argv.min ? true : false,//是否压缩
        autoprefixer: false
      }))
      .pipe(gulp.dest(path.join(process.env.PWD, process.env.PUBLISH_DIR, 'css', baseConfig.path)));
});

gulp.task('cp_img', ['css_img'], function (done) {
  gulp.src(path.join(process.env.PWD, 'client/image', baseConfig.path, '**'))
      .pipe(gulp.dest(path.join(process.env.PWD, process.env.PUBLISH_DIR, 'image', baseConfig.path)));
  return gulp.src([path.join(process.env.PWD, 'client/image/common/**')])
      .pipe(gulp.dest(path.join(process.env.PWD, process.env.PUBLISH_DIR, 'image/common')));
});

gulp.task('cp_font', function (done) {
  return gulp.src(path.join(process.env.PWD, 'client/**/font', baseConfig.path, '**'))
      .pipe(gulp.dest(path.join(process.env.PWD, process.env.PUBLISH_DIR, baseConfig.path)));
});

gulp.task('cp_component', ['css_img'], function (done) {
  let cpPath = path.join(process.env.PWD, process.env.DEV_DIR, baseConfig.path, '/_/react-guide/**');
  if (!!componentResourcePath) {
    cpPath = path.join(process.env.PWD, process.env.DEV_DIR, baseConfig.path, componentResourcePath.substring(5) + '**');
  }
  return gulp.src(cpPath)
      .pipe(gulp.dest(path.join(process.env.PWD, process.env.PUBLISH_DIR, 'asset')));
});

gulp.task('cp_js', ['css_img'], function (done) {
  let filePath = ['!' + path.join(process.env.PWD, process.env.DEV_DIR, 'react.js'),
    path.join(__dirname, 'lib/react/react.js')];
  if (!Array.isArray(baseConfig.entry)) {
    filePath.push(path.join(process.env.PWD, process.env.DEV_DIR, baseConfig.path, '**/*.js'));
  } else {
    filePath.push(path.join(process.env.PWD, process.env.DEV_DIR, baseConfig.path, '*.js'));
  }
  return gulp.src(filePath)
      .pipe(gulp.dest(path.join(process.env.PWD, process.env.PUBLISH_DIR, 'js', baseConfig.path)));
});

gulp.task('cp_html', ['css_img'], function (done) {
  let filePath = Array.isArray(baseConfig.entry) ?
      path.join(process.env.PWD, baseConfig.htmlPath, baseConfig.path, '*.html') :
      path.join(process.env.PWD, baseConfig.htmlPath, baseConfig.path, '**/*.html')

  return gulp.src(filePath)
      .pipe(replace(/_tmp\/.+\.js\.css/g, function(match) {
          var newStr = match.replace(".js.css", ".css");
          return newStr;
      }))
      .pipe(replace(/\.\.\/_tmp\/.+\.js/g, function(match) {
          var newStr = match.replace("../_tmp/", "js/");
          return newStr;
      }))
      .pipe(replace(/<!--__css__/g, function(match) {
          return "";
      }))
      .pipe(replace(/__css__-->/g, function(match) {
          return "";
      }))
      .pipe(replace(/<!--__script__/g, function(match) {
          return "";
      }))
      .pipe(replace(/__script__-->/g, function(match) {
          return "";
      }))
      .pipe(gulp.dest(path.join(process.env.PWD, process.env.PUBLISH_DIR, 'html', baseConfig.path)));
});

gulp.task('cp_jade_to_html', ['css_img'], function (done) {
  let filePath = Array.isArray(baseConfig.entry) ?
    path.join(process.env.PWD, process.env.DEV_DIR, baseConfig.path, '*.jade') :
    path.join(process.env.PWD, process.env.DEV_DIR, baseConfig.path, '**/*.jade')

  return gulp.src(filePath)
      .pipe(replace(/_tmp\/.+\.js\.css/g, function(match) {
        return match.replace(".js.css", ".css");
      }))
      .pipe(replace(/\.\.\/_tmp\/.+\.js/g, function(match) {
        return match.replace("../_tmp/", "js/");
      }))
      .pipe(replace(/<!--__css__/g, function(match) {
        return "";
      }))
      .pipe(replace(/__css__-->/g, function(match) {
        return "";
      }))
      .pipe(replace(/<!--__script__/g, function(match) {
        return "";
      }))
      .pipe(replace(/__script__-->/g, function(match) {
        return "";
      }))
      .pipe(rename(function (path) {
        path.extname = ".html";
        return path;
      }))
      .pipe(prettify({
        config: path.join(__dirname, '.jsbeautifyrc')
      }))
      .pipe(gulp.dest(path.join(process.env.PWD, process.env.PUBLISH_DIR, 'html', baseConfig.path)));
});

gulp.task('clean_tempfile', ['cp_jade_to_html'], function() {
  let delFileList = [];
  if (!Array.isArray(baseConfig.entry)) {
    for (let key in baseConfig.entry) {
      for (let i in baseConfig.entry[key]) {
        let fileName = baseConfig.entry[key][i];
        delFileList.push(path.join(process.env.PWD, process.env.DEV_DIR, baseConfig.path, `${fileName}.jade`));
      }
    }
  } else {
    for (let i in baseConfig.entry) {
      let fileName = baseConfig.entry[i];
      delFileList.push(path.join(process.env.PWD, process.env.DEV_DIR, baseConfig.path, `${fileName}.jade`));
    }
  }
  del.sync(delFileList);
});

gulp.task('compress', function(cb) {
  return gulp.src(path.join(process.env.PWD, process.env.PUBLISH_DIR, '/**'))
    .pipe(zip('publish.zip'))
    .pipe(gulp.dest(path.join(process.env.PWD, 'publish')));
});

gulp.task('upload_zip', ['compress'], function() {
  let host = argv.h || 'http://wapstatic.kf0309.3g.qq.com/deploy';
  let userName = argv.u || baseConfig.userName;
  let projName = argv.p || baseConfig.projectName;
  return gulp.src(path.join(process.env.PWD, 'publish/publish.zip'))
    .pipe(upload({
      url: host,
      data: {
        to: `/data/wapstatic/${userName}/${projName}`
      },
      callback: function() {
        del.sync(path.join(process.env.PWD, 'publish/publish.zip'), { force: true });

        if (argv.o | argv.open) {
          require('open')(
            `http://wapstatic.kf0309.3g.qq.com/${userName}/${projName}/html/index.html`);
        }
      },
      timeout: 15000
    }));
});

//构建到publish
gulp.task('publish', ['css_img', 'cp_img', 'cp_font', 'cp_js', 'cp_jade_to_html'], function (done) {
  console.log("Finished publish...");
  console.log("Success!");
});

//获取所有文件
function getAllFiles(path, fileList){
  fileList = fileList || [];
  let dirList = fs.readdirSync(path);
  dirList.forEach(function(item){
    if (fs.statSync(path + '/' + item).isDirectory()) {
      getAllFiles(path + '/' + item, fileList);
    } else {
      fileList.push(path + '/' + item);
    }
  });
  return fileList;
}

//上传CDN
function uploadCDN(file, callback) {
  let cdnUrl = 'http://inner.up.cdn.qq.com:8080/uploadserver/uploadfile.jsp';
  let params = {
      appname: config.cdn.appname,
      user: config.cdn.userName || config.userName,
  },
  dirname = path.dirname(file),
  extname = path.extname(file),
  basename = path.basename(file, extname),
  filePath = dirname.replace('./publish', config.cdn.rootPath);
  extname = extname.replace('.', '');
  if (extname!='woff' && extname!='woff2' && extname!='eot' && extname!='ttf' && extname!='svg' && extname!='png' && extname!='gif' && extname!='jpg' && extname!='js' && extname!='css') {
    console.info("didn't upload %s", file);
    cndFileObj.fileKey++;
    return;
  }

  params = Object.assign(params, {
    filepath: filePath,
    filename: basename,
    filetype: extname,
    filesize: fs.statSync(file).size
  });
  request.post({
    headers: {
      'X-CDN-Authentication': config.cdn.token
    },
    url: cdnUrl + '?' + querystring.stringify(params),
    body: fs.createReadStream(file)
  }, function (err, xhr, body) {
    if (err || xhr.statusCode !== 200) {
      console.error(err || xhr.statusCode);
      console.error('存在上传失败文件，不会执行css引用资源路径替换');
      return;
    }
    let data = JSON.parse(body);
    if (data.ret_code !== 200) {
      console.error(`CDN upload ${file} failed: ${data.err_msg}`);
      console.error('存在上传失败文件，不会执行css引用资源路径替换');
      return;
    }
    console.info('CDN upload %s to %s success.', file, data.cdn_url);
    cndFileObj.fileKey++;
    if (cndFileObj.fileKey == cndFileObj.fileNumber) {
      let arrUrl = data.cdn_url.split(config.cdn.rootPath)
      callback && callback(arrUrl[0]+config.cdn.rootPath+'/');
    }
  });
}

//替换css中本地资源文件路径为CDN路径
function cdnUrl(url) {
  gulp.src('./publish/css'+config.samePath+'/**/*.css')
      .pipe(replace(/url\([^_:\n\r\)]+\)/gi, function(match) {
          var str = match.toLowerCase();
          if (str.indexOf('url(//') > -1) {
              return match;
          }
          var filePath = match.replace(/url\((\.\.\/)+/, 'url('+url);
          return filePath;
      }))
      .pipe(gulp.dest('./publish/css'+config.samePath));
  console.info('css中资源文件已经替换为CDN资源');
}

//需上传CDN的文件的信息
let cndFileObj = {
  fileNumber: 0, //一共多少个文件
  fileKey: 0 //正在上传第几个文件
};
cndFileObj.cndFileList = new Set();

//项目中需上传CND的文件 按文件夹
gulp.task('folder_cdn', function() {
  let files = getAllFiles('./publish/image'+config.samePath);
  files = files.concat(getAllFiles('./publish/font'+config.samePath));
  files = files.concat(getAllFiles('./publish/asset'+config.samePath));
  files.map(x => cndFileObj.cndFileList.add(x));
  cndFileObj.fileNumber = cndFileObj.cndFileList.size;
  cndFileObj.fileKey = 0;
  for (file of cndFileObj.cndFileList) {
      uploadCDN(file, cdnUrl);
  }
});

//获取到css中的资源文件
gulp.task('get_cnd_file', function() {
  return gulp.src('./publish/css'+config.samePath+'/*.css')
    .pipe(replace(/url\([^_:\n\r\)]+\)/gi, function(match) {
      let str = match.toLowerCase();
      if (str.indexOf('url(//') > -1) {
          return match;
      }
      let filePath = match.replace(/url\((\.\.\/)+/, './publish/').replace(')', '');
      cndFileObj.cndFileList.add(filePath);
      return match;
    })
  );
});

//上传css中的资源文件
gulp.task('use_cdn', ['get_cnd_file'], function() {
  cndFileObj.fileNumber = cndFileObj.cndFileList.size;
  cndFileObj.fileKey = 0;
  for (file of cndFileObj.cndFileList) {
    uploadCDN(file, cdnUrl);
  }
});
