function parseFile(file, plugins, isModule) {

    let plugin, match;

    for (let i = 0, l = plugins.length; i < l; i++)
    {
        if ((plugin = plugins[i]) && (match = plugin.match) && match.test(file))
        {
            return isModule && plugin.module ? plugin.module(file) : plugin.parse(file);
        }
    }
}


function parseFiles(resolve, outputs, files, index, plugins, isModule) {

    let length = files.length;
    let result = parseFile(files[index], plugins, isModule);

    if (result instanceof Promise)
    {
        promise.then(value => {
        
            outputs.push(value);

            if (++index >= length)
            {
                resolve(outputs);
            }
            else
            {
                parseFiles(resolve, outputs, files, index, plugins, isModule);
            }

        }).catch(e => {

            throw e;
        });
    }
    else
    {
        outputs.push(result);

        if (++index >= length)
        {
            resolve(outputs);
        }
        else
        {
            parseFiles.apply(this, arguments);
        }
    }
}



module.exports = function (files, plugins, isModule) {

    return new Promise(resolve => {

        parseFiles(resolve, [], files, 0, plugins, isModule);
    });
}
