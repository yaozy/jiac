const jiac = require('./lib');


jiac.js
    .module('', 'client/(require|thread|template).js')
    .combine()
    .compress()
    .output('client/jiac.1.0.js');
