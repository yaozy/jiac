const Compressor = require('../lib/compressor')

const combine = require('../lib/combine');

const compress = require('./compress')

const template = require('./template');



const loads = Object.create(null);



loads.js = function (next, data, files, list, index) {

    let text = compress(list[index]).replace(/'/g, "\\'");

    list[index] = "jiac.cache('" + files[index] + "', '" + text + "');\n";

    loadModule(next, data, files, list, index + 1);
}


loads.css = function (next, data, files, list, index) {

}


loads.json = function (next, data, files, list, index) {

    let text = JSON.stringify(JSON.parse(list[index])).replace(/'/g, "\\'");

    list[index] = "jiac.cache('" + files[index] + "', '" + text + "');\n";

    loadModule(next, data, files, list, index + 1);
}


loads.html = function (next, data, files, list, index) {

    let text = template(list[index]);

    text =  text.replace(/[\t\n]+/g, '').replace(/'/g, "\\'");

    list[index] = "jiac.cache('" + files[index] + "', '" + text + "');\n";

    loadModule(next, data, files, list, index + 1);
}


loads.less = function (next, data, files, list, index) {

    require('../css-compressor/less')(text).then(output => {

        let text = output.css.replace(/'/g, "\\'");

        list[index] = "jiac.cache('" + files[index] + "', '" + text + "');\n";

        loadModule(next, data, files, list, index + 1);

    }).catch(function (reason) {
        
        throw reason;
    });
}



function loadModule(next, data, files, list, index) {

    let file = files[index];

    if (file)
    {
        let fn = loads[file.substring(file.lastIndexOf('.') + 1).toLowerCase()];

        if (fn)
        {
            fn(next, data, files, list, index);
        }
        else
        {
            console.error('error source file: ' + file);
        }
    }
    else
    {
        data.push.apply(data, list);
        next.resolve(data)
    }
}


function convertPath(path, files) {

    path = require('path').join(process.cwd(), path).replace(/\\/g, '/');

    if (path[path.length - 1] !== '/')
    {
        path += '/';
    }

    for (let i = files.length; i--;)
    {
        files[i] = files[i].replace(/\\/g, '/').replace(path, '');
    }

    return files;
}



module.exports = class JSCompressor extends Compressor {


    module(root, base, files) {

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

            let list = [];

            combine(list, base, files);

            if (list.length > 0)
            {
                let files = convertPath(root, list.files);

                loadModule(next, data, files, list, 0);
            }
            else
            {
                next.resolve(data);
            }
        });
    }


    html(root, base, files) {

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

            let list = [];

            combine(list, base, files);

            if (list.length > 0)
            {
                let files = convertPath(root, list.files);

                for (let i = 0, l = list.length; i < l; i++)
                {
                    let text = list[i].replace(/[\r\n]\s*/g, '').replace(/'/g, "\\\'");

                    list[i] = "jiac.cache('" + files[i] + "', '" + text + "');\n";
                }
            }
            else
            {
                next.resolve(data);
            }
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

