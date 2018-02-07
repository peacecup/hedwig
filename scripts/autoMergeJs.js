/**
 * Created by binwang on 17/7/11.
 * auto create saga and reducer index.js
 */

let fs = require('fs');
let Handlebars = require('handlebars');
let _ = require('lodash');
let util = require('./util');

function AutoMergeJs(options) {
}
AutoMergeJs.prototype.apply = function (compiler) {
    compiler.plugin('emit', function (compilation, callback) {


        function createIndex(src, targetFile) {
            //获取所有目录文件的名建明，除模板相关文件
            let files = util.readFilesInDir(src, {
                prefix: '.',
                excludeFiles: ['index.vue', 'index.js', 'index.tpl'],
                format: (f) => f.substring(0, _.lastIndexOf(f, '.'))
            });

            targetFile.forEach(f => {
                //获取模板文件
                let data = fs.readFileSync(src + '/' + f.template, 'utf-8');
                const template = Handlebars.compile(data);
                //利用目录文件遍历模板生成文件
                let result = template({
                    list: files
                });
                try{
                    //获取原编译结束后的文件
                    let old = fs.readFileSync(src + '/' + f.target, 'utf-8');
                    //如果和源文件不同，则将新的结果写入到文件中
                    if (old !== result)
                        fs.writeFileSync(src + '/' + f.target, result);
                }catch(e){
                    fs.writeFileSync(src + '/' + f.target, result);
                }
            });
        }

        let _targetFile = [{
            template: 'index.tpl',
            target: 'index.js',
        }];
        createIndex('./src/actions', _targetFile);
        createIndex('./src/components/pages', _targetFile);
        createIndex('./src/components/common', _targetFile);
        callback();
    });
};

module.exports = AutoMergeJs;