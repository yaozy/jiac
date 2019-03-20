const fs = require('fs');


exports.match = /\.js$/i;


exports.parse = function (file) {

    return fs.readFileSync(file, 'utf8');
}


exports.module = function (file) {

}
