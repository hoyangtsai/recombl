var gulp = require('gulp');
var uglify = require('gulp-uglify');
var postcss = require('gulp-postcss');
var sprites = require('postcss-sprites').default;
var replace = require('gulp-replace');
var rename = require('gulp-rename');
var prettify = require('gulp-jsbeautifier');
var base64 = require('gulp-base64');
var zip = require('gulp-zip');
var upload = require('gulp-file-post');
var del = require('del');
var cssnano = require('gulp-cssnano');
var fs = require('fs');
var path = require('path');
var request = require('request');
var querystring = require('querystring');
var gcmq = require('gulp-group-css-media-queries');

global.__ISGULPFILE__ = true;
var config = require('./config/ignore/index.js').baseConfig;

var getLayerPath = function (str) {
    if (!str) {
        str = "/";//解决QQ浏览器项目samePath为空的情况
    }
    var arr = str.split("/"), layerPath = "";
    var layer = arr.length;
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

//判断是否是数组
function isArray(o){
    return Object.prototype.toString.call(o)=='[object Array]';
}

var componentResourcePath;//组件资源在dist的目录
//雪碧图 图片base64
gulp.task('css_img', function (done) {
    var opts = {
        stylesheetPath: './publish/css',
        spritePath: './publish/img'+config.samePath+'/',
        spritesmith: config.img.spritesmith,
        retina:  config.img.retina,
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

    var spritesGroupBy = function(image) {
        var groupName = 'x';
        var groups = /\.__sprite.*/gi.exec(image.url);
        var arrName = groups[0].split('__'), arrNameLen = arrName.length;
        if (arrNameLen >= 3) {
            groupName = arrName[2].split(".")[0];
        }
        image.retina = config.img.retina;
        image.ratio = config.img.ratio;
        return Promise.resolve(groupName);
    }

    var layerPath = getLayerPath(config.samePath);

    if (!isArray(config.fileName)) {
        var delFileList = [];
        for (key in config.fileName) {
            delFileList.push('./dist'+config.samePath+'/'+key+'.js');
            delFileList.push('./src/container'+config.samePath+'/'+key+'.jsx');
        }
        del.sync(delFileList);
    }

    var stream = gulp.src('./dist'+config.samePath+'/*.css')
        .pipe(postcss([sprites(opts)]))//合并雪碧图
        .pipe(base64({//图片base64
            extensions: [/\.__inline\.png$/i, /\.__inline\.svg$/i, /\.__inline\.jpe?g$/i, /\.__inline\.ttf$/i],
            deleteAfterEncoding: false,
            maxImageSize: 100*1024,
            debug: false
        }))
        .pipe(replace(/url\([^_:\n\r]+\/img\//gi, function(match) {
            var str = match.toLowerCase();
            if (str.indexOf('url(//') > -1) {
                return match;
            }
            return 'url('+layerPath+'img/';
        }))//更正图片路径
        .pipe(replace(/url\([^_:\n\r]+\/font\//gi, function(match) {
            var str = match.toLowerCase();
            if (str.indexOf('url(//') > -1) {
                return match;
            }
            return 'url('+layerPath+'font/';
        }))//更正字体路径
        .pipe(replace(/url\(.+\/_.*\/react-guide\//g, function(match) {
            componentResourcePath = match;
            return 'url('+layerPath+'asset/';
        }))//更正组件资源路径
        .pipe(rename(function (path) {//把.js.css的css重命名
            path.dirname = "";
            if (path.basename.indexOf(".js") > -1) {
                var arrName = path.basename.split(".js");
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
            core: false,//是否压缩
            autoprefixer: false
        }))
        .pipe(gulp.dest('./publish/css'+config.samePath));
    return stream;
});

gulp.task('cp_img', ['css_img'], function (done) {
    gulp.src('./src/img'+config.samePath+'/**')
        .pipe(gulp.dest('./publish/img'+config.samePath+'/'));
    return gulp.src(['./src/img/common/**'])
        .pipe(gulp.dest('./publish/img/common/'));
});

gulp.task('cp_font', function (done) {
    return gulp.src('./src/font'+config.samePath+'/**')
        .pipe(gulp.dest('./publish/font'+config.samePath+'/'));
});

gulp.task('cp_component', ['css_img'], function (done) {
    var cpPath = './dist'+config.samePath+'/_/react-guide/**';
    if (!!componentResourcePath) {
        cpPath = './dist' + config.samePath + componentResourcePath.substring(5) + '**';
    }
    return gulp.src(cpPath)
        .pipe(gulp.dest('./publish/asset'));
});

gulp.task('cp_js', ['css_img', 'clean_tempfile'], function (done) {
    var filePath = ['!./dist/react.js'];
    if (!isArray(config.fileName)) {
        filePath.push('./dist'+config.samePath+'/**/*.js');
    } else {
        filePath.push('./dist'+config.samePath+'/*.js');
    }
    return gulp.src(filePath)
        // .pipe(uglify())
        .pipe(gulp.dest('./publish/js'+config.samePath));
});

gulp.task('cp_html', ['css_img'], function (done) {
    var filePath = './src/html'+config.samePath+'/*.html';
    if (!isArray(config.fileName)) {
        filePath = './src/html'+config.samePath+'/**/*.html';
    }
    return gulp.src(filePath)
        .pipe(replace(/dist\/.+\.js\.css/g, function(match) {
            var newStr = match.replace(".js.css", ".css");
            return newStr;
        }))
        /*.pipe(replace(/dist\/.+\.css/g, function(match) {
            var newStr = match.replace("dist/", "css/");
            return newStr;
        }))*/
        .pipe(replace(/\.\.\/dist\/.+\.js/g, function(match) {
            var newStr = match.replace("../dist/", "js/");
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
        .pipe(gulp.dest('./publish/html'+config.samePath));
});

gulp.task('cp_jade_to_html', ['css_img', 'cp_html'], function (done) {
    var filePath = './src/html'+config.samePath+'/*.jade';
    if (!isArray(config.fileName)) {
        filePath = './src/html'+config.samePath+'/**/*.jade';
    }
    return gulp.src(filePath)
        .pipe(replace(/dist\/.+\.js\.css/g, function(match) {
            var newStr = match.replace(".js.css", ".css");
            return newStr;
        }))
        /*.pipe(replace(/dist\/.+\.css/g, function(match) {
            var newStr = match.replace("dist/", "css/");
            return newStr;
        }))*/
        .pipe(replace(/\.\.\/dist\/.+\.js/g, function(match) {
            var newStr = match.replace("../dist/", "js/");
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
        .pipe(rename(function (path) {
            // path.dirname = "";
            path.extname = ".html";
            return path;
        }))
        .pipe(prettify())
        .pipe(gulp.dest('./publish/html'+config.samePath));
});

gulp.task('clean_tempfile', ['cp_jade_to_html'], function() {
    var delFileList = [];
    if (!isArray(config.fileName)) {
        for (key in config.fileName) {
            for (i in config.fileName[key]) {
                var fileName = config.fileName[key][i];
                delFileList.push('./src/html'+config.samePath+'/'+fileName+'.jade');
            }
        }
    } else {
        for (i in config.fileName) {
            var fileName = config.fileName[i];
            delFileList.push('./src/html'+config.samePath+'/'+fileName+'.jade');
        }
    }
    del.sync(delFileList);
});


gulp.task('compress', function(cb) {
  return gulp.src('./publish/**')
    .pipe(zip('publish.zip'))
    .pipe(gulp.dest('./publish'));
});

gulp.task('upload_zip', ['compress'], function() {
  return gulp.src('./publish/publish.zip')
    .pipe(upload({
        url: "http://wapstatic.kf0309.3g.qq.com/deploy",
        data: {
            to: "/data/wapstatic/"+config.userName+"/"+config.projectName
        },
        callback: function() {
            del.sync(['./publish/publish.zip']);
        },
        timeout: 15000
    }));
});

gulp.task('del_zip', ['upload_zip'], function() {
    del.sync(['./publish/publish.zip']);
});

//构建到publish
gulp.task('publish', ['css_img', 'cp_img', 'cp_font', 'cp_component', 'cp_js', 'cp_html', 'cp_jade_to_html', 'clean_tempfile'], function (done) {
    console.log("Finished 'publish'...");
    console.log("Success!");
});

//上传到wapstatic
gulp.task('upload', ['del_zip'], function() {
});



//获取所有文件
function getAllFiles(path, fileList){
    fileList = fileList || [];
    var dirList = fs.readdirSync(path);
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
    var cdnUrl = 'http://inner.up.cdn.qq.com:8080/uploadserver/uploadfile.jsp';
    var params = {
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
        var data = JSON.parse(body);
        if (data.ret_code !== 200) {
            console.error(`CDN upload ${file} failed: ${data.err_msg}`);
            console.error('存在上传失败文件，不会执行css引用资源路径替换');
            return;
        }
        console.info('CDN upload %s to %s success.', file, data.cdn_url);
        cndFileObj.fileKey++;
        if (cndFileObj.fileKey == cndFileObj.fileNumber) {
            var arrUrl = data.cdn_url.split(config.cdn.rootPath)
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
var cndFileObj = {
    fileNumber: 0,//一共多少个文件
    fileKey: 0//正在上传第几个文件
};
cndFileObj.cndFileList = new Set();

//项目中需上传CND的文件 按文件夹
gulp.task('folder_cdn', function() {
    var files = getAllFiles('./publish/img'+config.samePath);
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
            var str = match.toLowerCase();
            if (str.indexOf('url(//') > -1) {
                return match;
            }
            var filePath = match.replace(/url\((\.\.\/)+/, './publish/').replace(')', '');
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