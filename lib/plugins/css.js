const fs = require('fs');


exports.match = /\.css$/i;


exports.parse = function (file) {

    return fs.readFileSync(file, 'utf8');
}
