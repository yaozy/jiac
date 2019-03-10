const Compressor = require('../lib/compressor')

const less = require('./less');
const compress = require('./compress');


module.exports = class CSSCompressor extends Compressor {


    less(options) {

        return this.registry((next, data) => {

            next.suspended = true;
            data = data.join('\r\n');

            less(data, options).then(output => {

                next.resolve([output.css]);

            }).catch(function (reason) {
                
                throw reason;
            });
        });
    }

    compress(options) {

        return this.registry((next, data) => {

            data = data.join('\r\n');

            data = compress(data, options);
            next.resolve([data]);
        });
    }
}
