const Compressor = require('./js-compressor');


new Compressor()
    .load('client/(require|thread|template).js')
    .combine()
    // .compress()
    .output('client/jiac.1.0.js');
