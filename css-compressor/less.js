const less = require('less');


module.exports = async function (text, options) {

    return less.render(text, options);
}
