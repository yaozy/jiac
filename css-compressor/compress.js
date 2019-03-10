const cleancss = require('clean-css');
    

module.exports = function (text, options) {

    return new cleancss(options).minify(text).styles;
}
