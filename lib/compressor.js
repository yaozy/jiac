const fs = require('fs');
const path = require('path');

const combine = require('./combine');


module.exports = class Compressor {


    registry(fn) {

        var next = this.__next = new this.constructor();

        if (this.suspended)
        {
            next.suspended = true;
            this.__fn = fn;
        }
        else
        {
            fn.call(this, next, this.__data || []);
        }

        return next;
    }


    resolve(data) {

        var next = this.__next;

        if (next)
        {
            this.__fn(next, data || []);
        }
        else
        {
            this.__data = data;
        }
    }


    load(files) {

        if (typeof files === 'string')
        {
            files = [files];
        }

        return this.registry((next, data) => {

            combine(data, files);
            next.resolve(data);
        });
    }


    push(text) {

        return this.registry((next, data) => {

            if (text)
            {
                data.push(text);
            }

            next.resolve(data);
        });
    }


    combine(seperator) {

        return this.registry((next, data) => {

            data = data.join(seperator || '\r\n');
            next.resolve([data]);
        });
    }


    output(file) {

        return this.registry((next, data) => {

            data = data.join('\r\n');

            fs.writeFileSync(path.join(process.cwd(), file), data, 'utf8');
            next.resolve([data]);
        });
    }

}
