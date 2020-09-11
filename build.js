const Compressor = require('./js-compressor');


new Compressor()
    .load('client/(require|thread).js')
    .combine()
    // .compress()
    .output('client/jiac.js');


const Watcher = require('./watcher');


new Watcher('./test/inputs', './test/outputs', /\.(wx|h5)\.\w+/i)
    .template(/\.html$/i)
    .plugin(/\.css$/i, null, file => file.replace(/\.css$/i, '.wxss'))
    .sync()
    .watch();
