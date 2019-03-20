const fs = require('fs');


// 扩展解析模板的方法
global.jiac = Object.create(null);

global.DOMParser = require('xmldom').DOMParser;

require('../../client/template')



exports.match = /\.(html|htm)$/i;


exports.parse = function (file) {

    return fs.readFileSync(file, 'utf8');
}


exports.module = function (file) {

    jiac.template();
}
