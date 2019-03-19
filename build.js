const Compressor = require('./js-compressor');


new Compressor()
    .load('client/(require|template).js')
    .combine()
    .output('client/jiac.1.0.js')
    
    .compress()
    .output('client/jiac.1.0.min.js');
