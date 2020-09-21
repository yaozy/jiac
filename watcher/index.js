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


    constructor(sourcePath, targetPath, excludeRegexPattern, textRegexPattern) {

        this.sourcePath = path.join(cwd, sourcePath);
        this.targetPath = path.join(cwd, targetPath);
        this.excludeRegexPattern = excludeRegexPattern;
        this.textRegexPattern = textRegexPattern || /\.(js|json|css|less|saas|txt|html|htm|xml|[a-z][a-z]ml|[a-z][a-z]ss|wxs)$/i;
        this.plugins = [];
    }


    plugin(regexPattern, convertDataFn, convertFileFn) {

        if (regexPattern instanceof RegExp)
        {
            if (!convertDataFn && !convertFileFn)
            {
                throw new Error('plugin convertDataFn and convertFileFn can\'t be null both!');
            }

            this.plugins.push(regexPattern, convertDataFn, convertFileFn);
            return this;
        }

        throw new Error('plugin regexPattern must be a Regex!');
    }


    template(regexPattern) {

        if (regexPattern instanceof RegExp)
        {
            this.plugins.push(regexPattern, template, file => file + '.js');
            return this;
        }

        throw new Error('template regexPattern must be a Regex!');
    }


    watch() {

        require('node-watch')(this.sourcePath, { recursive: true }, (event, file) => {

            if (event === 'remove')
            {
                let plugins = this.plugins;
                let index = 0;
                let any;

                file = file.replace(this.sourcePath, this.targetPath);

                while (any = plugins[index])
                {
                    if (any.test(file) && (any = plugins[index + 2]))
                    {
                        file = plugins[index + 2](file) || file;
                        break;
                    }
    
                    index += 3;
                }

                fs.rmdirSync(file);
            }
            else
            {
                this.syncFile(file);
            }
        });

        return this;
    }


    sync(sourcePath) {

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
            return this.sync(sourceFile);
        }

        if (this.excludeRegexPattern && this.excludeRegexPattern.test(sourceFile))
        {
            return;
        }
        
        // 只有文本类型的文件才支持插件处理
        if (this.textRegexPattern.test(sourceFile))
        {
            let plugins = this.plugins;
            let index = 0;
            let any;

            data = fs.readFileSync(sourceFile, 'utf8');

            while (any = plugins[index])
            {
                if (any.test(sourceFile))
                {
                    if (any = plugins[index + 1])
                    {
                        data = any(data, sourceFile);
                    }

                    if (plugins[index + 2])
                    {
                        file = plugins[index + 2](file) || file;
                    }

                    break;
                }

                index += 3;
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
