const fs = require('fs');
const path = require('path');

const combine = require('./combine');



process.on('unhandledRejection', (reason, p) => {

    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});



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


    load(base, files) {

        if (!files)
        {
            files = base;
            base = '';
        }

        if (typeof files === 'string')
        {
            files = [files];
        }

        return this.registry((next, data) => {

            combine(data, base, files);
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


    replace(fn) {

        return this.registry((next, data) => {

            for (let i = 0, l = data.length; i < l; i++)
            {
                data[i] = fn(data[i]);
            }

            next.resolve(data);
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
