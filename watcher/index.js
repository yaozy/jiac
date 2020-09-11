const path = require('path');
const fs = require('../lib/fs-await');

const cwd = process.cwd();


global.DOMParser = require('xmldom').DOMParser;

const template = require('../lib/template');




function loadFiles(dir, outputs) {

    let files = fs.readdirSync(dir);

    for (let i = 0, l = files.length; i < l; i++)
    {
        let file = path.join(dir, files[i]);

        if (fs.statSync(file).isDirectory())
        {
            loadFiles(file, outputs);
        }
        else
        {
            outputs.push(file);
        }
    }
}




module.exports = class Watcher {


    constructor(sourcePath, targetPath, textPattern) {

        this.sourcePath = path.join(cwd, sourcePath);
        this.targetPath = path.join(cwd, targetPath);
        this.textPattern = textPattern || /\.(js|json|css|less|saas|txt|html|htm|xml|[a-z][a-z]ml|[a-z][a-z]ss|wxs)$/i;
        this.plugins = [];
    }


    plugin(pattern, fn, ext) {

        this.plugins.push(pattern, fn, ext);
        return this;
    }


    template(pattern) {

        this.plugins.push(pattern, template, '.js');
        return this;
    }


    watch() {

        require('node-watch')(this.sourcePath, { recursive: true }, (event, file) => {

            if (event === 'remove')
            {
                fs.rmdirSync(file.replace(this.sourcePath, this.targetPath));
            }
            else
            {
                this.syncFile(file);
            }
        });

        return this;
    }


    syncDir(sourcePath) {

        let files = [];

        loadFiles(sourcePath || this.sourcePath, files);

        for (let i = 0, l = files.length; i < l; i++)
        {
            this.syncFile(files[i]);
        }

        return this;
    }


    syncFile(sourceFile) {

        let file = sourceFile.replace(this.sourcePath, this.targetPath);
        let data;

        // 目录
        if (fs.statSync(sourceFile).isDirectory())
        {
            return this.syncDir(sourceFile);
        }
        
        // 只有文本类型的文件才支持插件处理
        if (this.textPattern.test(sourceFile))
        {
            let plugins = this.plugins;
            let index = 0;
            let pattern;

            data = fs.readFileSync(sourceFile, 'utf8');

            while (pattern = plugins[index++])
            {
                if (pattern.test(sourceFile))
                {
                    data = plugins[index](data);

                    if (plugins[index + 1])
                    {
                        file += plugins[index + 1];
                    }
                    break;
                }

                index += 2;
            }

            fs.writeFileSync(file, data, 'utf8');
        }
        else
        {
            data = fs.readFileSync(sourceFile);
            fs.writeFileSync(file, data);
        }

        return this;
    }


}
