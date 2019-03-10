let path = require('path');
let fs = require('fs');



module.exports = function (list, base, files) {

    base = path.join(process.cwd(), base);
    loadFiles(list, base, files);
}



function loadFiles(list, base, files) {

    let file;

    for (let i = 0, l = files.length; i < l; i++)
    {
        if (file = files[i])
        {
            // 拆分 (a|b|c) 形式文件为多个文件(保证加载顺序)
            if (file.indexOf('|') > 0 && (file = splitFile(file)))
            {
                loadFiles(list, base, file);
                continue;
            }

            if (list[file = path.join(base, file)])
            {
                continue;
            }

            if (file.indexOf('*') < 0)
            {
                if (!list[file])
                {
                    list[file] = true;
                    list.push(fs.readFileSync(file, 'utf8'));

                    (list.files || (list.files = [])).push(file)
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

                matchFiles(list, dir, regex, recursive);
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


function matchFiles(list, dir, regex, recursive) {
    
    let files = fs.readdirSync(dir);

    for (let i = 0, l = files.length; i < l; i++)
    {
        let file = path.join(dir, files[i]);

        if (fs.statSync(file).isDirectory())
        {
            if (recursive)
            {
                matchFiles(list, file, regex, true);
            }
        }
        else if (regex.test(file))
        {
            if (!list[file])
            {
                list[file] = true;
                list.push(fs.readFileSync(file, 'utf8'));

                (list.files || (list.files = [])).push(file)
            }
        }
    }
}

