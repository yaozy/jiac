const Compressor = require('../lib/compressor')

const combine = require('../lib/combine');

const compress = require('./compress')

const template = require('./template');



const loads = Object.create(null);



loads.js = function (next, data, files, list, index) {

    list[index] = "jiac.module('" + files[index] + "', function (require, exports, module) {\n\n\n\t" 
        + list[index].replace(/\n/g, '\n\t')
        + "\n});\n\n\n\n";

    loadModule(next, data, files, list, index + 1);
}


loads.css = function (next, data, files, list, index) {

}


loads.json = function (next, data, files, list, index) {

    let text = JSON.stringify(JSON.parse(list[index])).replace(/'/g, "\\'");

    list[index] = "jiac.module('" + files[index] + "', '" + text + "');\n\n\n\n";

    loadModule(next, data, files, list, index + 1);
}


loads.html = function (next, data, files, list, index) {

    let text = template(list[index]);

    list[index] = "jiac.module('" + files[index] + "', function (data) {\n\n" + [
        '\tvar __k = jiac.classes;\n',
        '\tvar color = jiac.color;\n\n',
        '\twith (data)\n\t{\n',
        '\t\treturn ',
        text.replace(/\n/g, '\n\t\t'),
        '\n\t}',
        '\n});\n\n\n\n',
    ].join('');

    loadModule(next, data, files, list, index + 1);
}


loads.less = function (next, data, files, list, index) {

    require('../css-compressor/less')(text).then(output => {

        let text = output.css.replace(/'/g, "\\'");

        list[index] = "jiac.module('" + files[index] + "', '" + text + "');\n\n\n\n";

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

    for (let i = files.length; i--;)
    {
        files[i] = files[i].replace(/\\/g, '/').replace(path, '');
    }

    return files;
}



module.exports = class JSCompressor extends Compressor {


    constructor(root) {

        super();

        let path = process.cwd();

        if (root)
        {
            path = require('path').join(path, root);
        }

        path = path.replace(/\\/g, '/');

        if (path[path.length - 1] !== '/')
        {
            path += '/';
        }

        this.root = path;
    }


    // 模块
    module(files) {

        if (typeof files === 'string')
        {
            files = [files];
        }

        return this.registry((next, data) => {

            let list = [];

            combine(list, files);

            if (list.length > 0)
            {
                let files = convertPath(this.root, list.files);

                loadModule(next, data, files, list, 0);
            }
            else
            {
                next.resolve(data);
            }
        });
    }


    // 全局js
    globalJS(files) {
        
        if (typeof files === 'string')
        {
            files = [files];
        }
        
        return this.registry((next, data) => {

            let list = [];

            combine(list, files);

            if (list.length > 0)
            {
                let files = convertPath(this.root, list.files);

                for (let i = 0, l = list.length; i < l; i++)
                {
                    list[i] = list[i] + "\njiac.data('" + files[i] + "', true);\n\n\n";
                }

                data.push.apply(data, list);
            }

            next.resolve(data);
        });
    }


    // 文本数据
    text(files, parse) {

        if (typeof files === 'string')
        {
            files = [files];
        }
        
        return this.registry((next, data) => {

            let list = [];

            combine(list, files);

            if (list.length > 0)
            {
                let files = convertPath(this.root, list.files);

                for (let i = 0, l = list.length; i < l; i++)
                {
                    let text = list[i];
                    
                    if (parse)
                    {
                        if (parse === 'html')
                        {
                            text = text.replace(/[\r\n]\s*/g, '');
                        }
                        else if (typeof parse === 'function')
                        {
                            text = parse(text);
                        }
                    }

                    text = text.replace(/'/g, "\\\'");
                    list[i] = "jiac.data('" + files[i] + "', '" + text + "');\n";
                }
                
                data.push.apply(data, list);
            }

            next.resolve(data);
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

