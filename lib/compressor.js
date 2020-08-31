const fs = require('fs');
const path = require('path');


module.exports = class Compressor {


    constructor() {

        this.__base = process.cwd();
        this.__promise = Promise.resolve([]);
        this.__loadfiles = Object.create(null);
    }


    then(fn) {

        this.__promise = this.__promise.then(fn);
        return this;
    }


    catch(fn) {

        this.__promise = this.__promise.catch(fn);
        return this;
    }


    base(dir) {

        this.__base = path.join(process.cwd(), dir);
        return this;
    }


    load(pattens) {

        return this.then(array => {
            
            let files = require('./match-files.js')(this.__base, pattens, this.__loadfiles);

            if (files.length > 0)
            {
                return require('./parse.js')(files, this.plugins(), false).then(value => {

                    array.push(...value);
                    return array;
                });
            }

            return array;
        });
    }


    push(text) {

        return this.then(array => {

            if (text !== void 0)
            {
                array.push(text);
            }

            return array;
        });
    }


    combine(seperator) {

        return this.then(array => {

            var text = array.join(seperator || '\r\n');
            return [text];
        });
    }


    replace(fn) {

        return this.registry((next, data) => {

            for (let i = 0, l = data.length; i < l; i++)
            {
                data[i] = fn(data[i]);
            }

            next.resolve(data);
        })
    }


    output(file, encoding) {

        return this.then(array => {

            var text = array.join('\r\n');

            fs.writeFileSync(path.join(this.__base, file), text, encoding || 'utf8');
            return [text];
        });
    }

}
