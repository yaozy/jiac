const Compressor = require('./compressor');



module.exports = class CSSCompressor extends Compressor {


    plugins() {

        let plugins = this.__plugins || (this.__plugins = [
            require('./plugins/css.js'),
            require('./plugins/less.js')
        ]);

        if (arguments.length > 0)
        {
            plugins.push(...arguments);
        }
        else
        {
            return plugins;
        }
    }


    less(options) {

        return this.then(array => {

            return require('./less').render(array.join('\r\n'), options).then(output => {

                return [output.css];

            }).catch(function (reason) {

                throw reason;
            });
        });
    }


    compress(options) {

        return this.then(array => {

            let text = array.join('\r\n');

            text = new (require('clean-css'))(options).minify(text).styles;

            return [text];
        });
    }

}
