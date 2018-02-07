/**
 * Created by binwang on 17/8/14.
 */
var fs = require("fs");

//path模块，可以生产相对和绝对路径
var path = require("path");
var _ = require("lodash");

//读取文件存储数组
function readFilesInDir(dirUrl, option) {
    var fileArr = [];

    var {excludeFiles = []} = option;
    var {format = null} = option;
    var {prefix = ''} = option;

    //excludeFiles中包含file时返回false；
    function exclude(file) {
        return !_.includes(excludeFiles, file);
    }

//获取文件数组
    function readFile(readurl, name) {
        var name = name;
        //同步读取文件目录
        let files = fs.readdirSync(readurl);

        files.forEach(function (filename) {
            //获取文件状态
            let stats = fs.statSync(path.join(readurl, filename));
            //如果是文件且不是index.vue/index.js/index.tpl，这三种文件要过滤掉
            if (stats.isFile() && exclude(filename)) {
                //options。format存在且是一个函数
                if (!!option.format && _.isFunction(option.format))
                    //获取文件名
                    filename = option.format(filename);
                var newUrl = name + '/' + filename;  // ./filename
                fileArr.push({name: filename, fullName: newUrl});
                //是子目录则递归处理
            } else if (stats.isDirectory()) {
                var dirName = filename;
                readFile(path.join(readurl, filename), name + '/' + dirName);
            }
        });
    }

    readFile(dirUrl, prefix);
    return _.chain(fileArr).filter(file => file.name && file.name !== '').sortBy((f) => f.fullName).value();
}

module.exports = {readFilesInDir: readFilesInDir};