let path = require('path');
let fs = require('fs');



module.exports = function (base, files, excludes) {

    var outputs = [];

    if (typeof files === 'string')
    {
        files = [files];
    }

    loadFiles(outputs, base, files, excludes);

    return outputs;
}



function loadFiles(outputs, base, files, excludes) {

    let file;

    for (let i = 0, l = files.length; i < l; i++)
    {
        if (file = files[i])
        {
            // 拆分 (a|b|c) 形式文件为多个文件(保证加载顺序)
            if (file.indexOf('|') > 0 && (file = splitFile(file)))
            {
                loadFiles(outputs, base, file, excludes);
                continue;
            }

            if (excludes[file = path.join(base, file)])
            {
                continue;
            }

            if (file.indexOf('*') < 0)
            {
                if (!excludes[file])
                {
                    excludes[file] = true;
                    outputs.push(file);
                }
            }
            else
            {
                // 获取*之前的目录
                let dir = path.dirname(file.substring(0, file.search(/[*(]/)) + 'x');

                let recursive = file.search(/[*][\s\S]*[*]/) >= 0;

                let regex = file
                    .replace(/[/\\]/g, '[/\\\\]')
                    .replace(/([.+-])/g, '\\$1')
                    .replace(/[*]+/g, text => {
                    
                        return text.length > 1 ? '[\s\S]+?' : '[^/\\\\]+?';
                    });

                regex = new RegExp('^' + regex + '$', 'i');

                matchFiles(outputs, dir, regex, recursive, excludes);
            }
        }
    }
}


function splitFile(file) {

    let start = file.indexOf('|');
    let end = file.indexOf(')', start);

    start = file.lastIndexOf('(', start);

    if (start >= 0 && end > 0)
    {
        let files = file.substring(start + 1, end).split('|');

        start = file.substring(0, start);
        end = file.substring(end + 1);

        for (let i = files.length; i--;)
        {
            files[i] = start + files[i] + end;
        }

        return files;
    }
}


function matchFiles(outputs, dir, regex, recursive, excludes) {
    
    let files = fs.readdirSync(dir);

    for (let i = 0, l = files.length; i < l; i++)
    {
        let file = path.join(dir, files[i]);

        if (fs.statSync(file).isDirectory())
        {
            if (recursive)
            {
                matchFiles(outputs, file, regex, true, excludes);
            }
        }
        else if (regex.test(file))
        {
            if (!excludes[file])
            {
                excludes[file] = true;
                outputs.push(file);
            }
        }
    }
}
