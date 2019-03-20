Object.defineProperty(exports, 'js', {

    get: function () {

        return new (require('./js-compressor'))();
    }
});


Object.defineProperty(exports, 'css', {

    get: function () {

        return new (require('./css-compressor'))();
    }
});
