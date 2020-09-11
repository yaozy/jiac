const Compressor = require('./js-compressor');


new Compressor()
    .load('client/(require|thread).js')
    .combine()
    // .compress()
    .output('client/jiac.js');


const Watcher = require('./watcher');


new Watcher('./client', './dist')
    .template(/\.html$/i)
    .syncDir()
    .watch();
