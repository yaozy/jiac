const Compressor = require('./js-compressor');


new Compressor()
    .load('client/(require|thread|template).js')
    .combine()
    // .compress()
    .output('client/jiac.js');


const dispatch = require('./dispatch');

dispatch('./client', './dist');