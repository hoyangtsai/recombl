const gulp = require('gulp');
const uglify = require('gulp-uglify');
const postcss = require('gulp-postcss');
const sprites = require('postcss-sprites');
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
const args = require('minimist')(String(process.argv.slice(5)).split(','));
const gutil = require('gulp-util');
const chalk = require('chalk');

const userConfig = require(path.join(process.env.PWD, 'userConfig'));
const pageConfig = require(path.join(process.env.PWD, userConfig.pageConfig));
const baseConfig = Object.assign({}, userConfig, pageConfig);

const devDir = baseConfig.devDirectory || '_tmp';

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

let libraryResourcePath;  //组件资源在dist的目录

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

  return gulp.src(path.join(process.env.PWD, devDir, baseConfig.path, '*.css'))
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
      })) //更正图片路径
      .pipe(replace(/url\([^_:\)\n\r]+\/font\//gi, function(match) {
          var str = match.toLowerCase();
          if (str.indexOf('url(//') > -1) {
            return match;
          }
          return 'url('+layerPath+'font/';
      })) //更正字体路径
      .pipe(replace(/url\(.+\/_\//, function(match) {
          libraryResourcePath = match;
          return 'url('+layerPath+'asset/';
      })) //更正外部组件库资源路径
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
        core: args.m || args.minimize ? true : false,//是否压缩
        autoprefixer: false
      }))
      .pipe(gulp.dest(path.join(process.env.PWD, process.env.PUBLISH_DIR, 'css', baseConfig.path)));
});

gulp.task('cp_img', ['css_img'], function (done) {
  gulp.src(path.join(process.env.PWD, 'client/image', baseConfig.path, '**'))
      .pipe(gulp.dest(path.join(process.env.PWD, process.env.PUBLISH_DIR, 'image', baseConfig.path)));
  gulp.src(path.join(process.env.PWD, devDir, 'client/container', baseConfig.path, '**'))
      .pipe(gulp.dest(path.join(process.env.PWD, process.env.PUBLISH_DIR, 'css/client/container', baseConfig.path)));  //处理项目级组件的资源文件
  return gulp.src([path.join(process.env.PWD, 'client/image/common/**')])
      .pipe(gulp.dest(path.join(process.env.PWD, process.env.PUBLISH_DIR, 'image/common')));
});

gulp.task('cp_font', function (done) {
  return gulp.src(path.join(process.env.PWD, 'client/**/font', baseConfig.path, '**'))
      .pipe(gulp.dest(path.join(process.env.PWD, process.env.PUBLISH_DIR, baseConfig.path)));
});

gulp.task('cp_library', ['css_img'], function (done) {
  gulp.src(path.join(process.env.PWD, devDir, baseConfig.path, 'node_modules', '**'))
      .pipe(gulp.dest(path.join(process.env.PWD, process.env.PUBLISH_DIR, baseConfig.path, 'html/node_modules')));
  let cpPath = path.join(process.env.PWD, devDir, baseConfig.path, '/_/**');
  if (!!libraryResourcePath) {
    cpPath = path.join(process.env.PWD, devDir, baseConfig.path, libraryResourcePath.substring(5) + '**');
  }
  return gulp.src(cpPath)
      .pipe(gulp.dest(path.join(process.env.PWD, process.env.PUBLISH_DIR, 'asset')));
});

gulp.task('cp_js', ['css_img'], function (done) {
  let filePath = [
    '!' + path.join(process.env.PWD, devDir, 'react.js'),
    path.join(__dirname, 'lib/react/react.js'),
    '!' + path.join(process.env.PWD, devDir, 'ssr', baseConfig.path, '**/*.js'),
    path.join(process.env.PWD, devDir, baseConfig.path, '**/*.js')
  ];
  return gulp.src(filePath)
      .pipe(gulp.dest(path.join(process.env.PWD, process.env.PUBLISH_DIR, 'js', baseConfig.path)));
});

gulp.task('cp_jade_to_html', ['css_img'], function (done) {
  let filePath = path.join(process.env.PWD, devDir, 'ssr', '**/*.jade')
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

gulp.task('compress', function(cb) {
  return gulp.src(path.join(process.env.PWD, process.env.PUBLISH_DIR, '/**'))
    .pipe(zip(process.env.PUBLISH_DIR + '.zip'))
    .pipe(gulp.dest(path.join(process.env.PWD, 'publish')));
});

gulp.task('upload_zip', ['compress'], function() {
  let host = args.h || 'http://wapstatic.kf0309.3g.qq.com/upload';
  let userName = args.u || baseConfig.userName;
  let projName = args.p || baseConfig.projectName;
  return gulp.src(path.join(
      process.env.PWD, process.env.PUBLISH_DIR, process.env.PUBLISH_DIR + '.zip'))
    .pipe(upload({
      url: host,
      data: {
        type: 'zip',
        to: `/data/wapstatic/${userName}/${projName}`
      },
      callback: function() {
        del.sync(path.join(
          process.env.PWD, process.env.PUBLISH_DIR, process.env.PUBLISH_DIR + '.zip'),
          { force: true }
        );
      },
      timeout: 15000
    }).on('error', function(err) {
      console.error(chalk.red(err));
    }).on('end', function() {
      gutil.log(chalk.yellow(`Served at: `));
      gutil.log(chalk.yellow(
        `http://wapstatic.kf0309.3g.qq.com/${userName}/${projName}/`));
    }));
});

gulp.task('clean_tmp', ['css_img', 'cp_js', 'cp_jade_to_html'], function() {
  del.sync(path.join(process.env.PWD, devDir, '**'), { force: true });
});

//构建到publish
gulp.task('publish', ['css_img', 'cp_img', 'cp_library', 'cp_font', 'cp_js', 'cp_jade_to_html'], function (done) {
  del.sync(path.join(process.env.PWD, devDir, '**'), { force: true });
  const fullDevDir = path.join(process.env.PWD, devDir)
  fs.mkdirSync(fullDevDir);
  fs.createReadStream(path.resolve(__dirname, 'lib/react/react_dev.js'))
    .pipe(fs.createWriteStream(path.join(fullDevDir, 'react.js')));
  console.log("Finished publish...");
  console.log("Success!");
});
