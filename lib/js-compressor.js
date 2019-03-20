const Compressor = require('./compressor')



function convertRoot(root) {

    root = require('path').join(process.cwd(), root).replace(/\\/g, '/');

    if (root[root.length - 1] !== '/')
    {
        root += '/';
    }

    return root;
}


function replaceRoot(root, file) {

    return file[i].replace(/\\/g, '/').replace(dist, '');
}



module.exports = class JSCompressor extends Compressor {

    

    plugins() {

        let plugins = this.__plugins || (this.__plugins = [
            require('./plugins/js.js'),
            require('./plugins/html.js'),
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


    module(root, pattens) {

        return this.then(array => {

            let files = require('./match-files.js')(this.__base, pattens, this.__loadfiles);

            if (files.length > 0)
            {
                return require('./parse.js')(files, this.plugins(), true).then(value => {
                    
                    let dist = convertRoot(root);
                    let data;

                    for (let i = 0, l = value.length; i < l; i++)
                    {
                        if (data = value[i])
                        {
                            if (typeof data === 'string')
                            {
                                data = data.replace("'", "\\'");
                            }

                            array.push("jiac.module('" + replaceRoot(dist, files[i]) + "', '" + data + "');\n");
                        }
                    }

                    return array;
                });
            }

            return array;
        });
    }


    cache(root, pattens) {

        return this.then(array => {

            let files = require('./match-files.js')(this.__base, pattens, this.__loadfiles);

            if (files.length > 0)
            {
                return require('./parse.js')(files, this.plugins(), false).then(value => {

                    let dist = convertRoot(root);
                    let data;

                    for (let i = 0, l = value.length; i < l; i++)
                    {
                        if (data = value[i])
                        {
                            if (typeof data === 'string')
                            {
                                data = data.replace("'", "\\'");
                            }

                            array.push("jiac.cache('" + replaceRoot(dist, files[i]) + "', '" + data + "');\n");
                        }
                    }

                    return array;
                });
            }
            
            return array;
        });
    }


    compress(options) {

        return this.then(array => {

            options = options || {};
            // options.fromString = true;
            options.output = options.output || { max_line_len: 10240000 };
        
            let result = require("uglify-js").minify(array.join('\r\n'), options);
        
            if (result.error)
            {
                throw result.error;
            }
        
            let text = result.code;
        
            if (options.copyright)
            {
                text = options.copyright + '\r\n\r\n\r\n\r\n' + text;
            }
        
            return [text];
        });
    }

}

