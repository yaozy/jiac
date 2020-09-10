
(function (window) {



    var create = Object.create;


    // 全局变量
    var jiac = window.jiac = create(null);


    // 全局require
    var global = window.require = factory(location.href.substring(0, location.href.lastIndexOf('/')));

	// 已加载的模块集合
	var modules = jiac.modules = create(null);

    // 注册的模块
    var cache = jiac.cache = create(null);

    // 多语言模块
    var languages = jiac.languages = create(null);

    // 相对url缓存
    var urls = create(null);

    // 扩展名缓存
    var exts = create(null);


    // 模块处理
    var handlers = create(null);


    // 默认版本号
    var version = ('' + Math.random()).replace('0.', '')

    // 文件对应版本号
    jiac.versions = create(null);




    function factory(base) {

        function require(url, flags) {

            return jiac.loadModule(require.base, url, flags);
        }

        require.base = require.baseURL = base;
        require.runAsThread = runAsThread;

        return require;
    }


    // 作为线程运行
    function runAsThread(fn) {

        return new jiac.Thread(global.base, this.base, fn);
    }



    function relative(url) {

        var last;

        while (true)
        {
            last = url.replace(/[^/]*\/\.\.\//, '');
            
            if (last === url)
            {
                break;
            }
            
            url = last;
        }
        
        return url.replace(/[.]+\//g, '');
    }


    function absolute(base, url) {

        // 相对根目录
        if (url[0] === '/')
        {
            base = global.base;
            return base + (base[base.length - 1] === '/' ? url.substring(1) : url);
        }

        // 相对当前目录
        url = (base[base.length - 1] === '/' ? base : base + '/') + url;

        return urls[url] || (urls[url] = relative(url));
    }


    function ajax(url) {

        var xhr = new XMLHttpRequest(),
            text;

		xhr.open('GET', url + '?v=' + (jiac.versions[url] || version), false);

        xhr.onreadystatechange = function () {

            if (this.readyState === 4)
            {
                if (this.status < 300)
                {
                    text = this.responseText;
                }
                else
                {
                    throw this.statusText;
                }
                
                this.onreadystatechange = null;
            }
        }

        xhr.send(null);

        return text;
    }


    handlers.css = function (url) {

        var text = cache[url] || ajax(url),
            dom = document.createElement('style'),
            color = jiac.color;  

        dom.setAttribute('type', 'text/css');  

        text = text.replace(/@([\w-]+)/g, function (text, key) {

            return color && color[key] || text;
        });
    
        if (dom.styleSheet) // IE  
        {
            dom.styleSheet.cssText = text;  
        }
        else // w3c  
        {
            dom.appendChild(document.createTextNode(text));  
        }
    
        document.head.appendChild(dom);

        return { exports: true };
    }


    handlers.js = function (url, flags) {

        var module = { exports: {} },
            any;

        if (any = cache[url])
        {
            any(
                factory(url.substring(0, url.lastIndexOf('/') + 1)),
                module.exports,
                module);
        }
        else if (any = ajax(url))
        {
            any = any + '\n//# sourceURL=' + url;

            // 全局执行
            if (flags === false)
            {
                eval.call(window, any);
            }
            else
            {
                new Function(['require', 'exports', 'module'], any)(
                    factory(url.substring(0, url.lastIndexOf('/') + 1)),
                    module.exports,
                    module);
            }
        }

		return module;
    }


    handlers.json = function (url) {

        var text = cache[url] || ajax(url);

        return { 
            exports: text ? JSON.parse(text) : null 
        };
    }


    handlers.html = function (url, flags) {

        var any = cache[url];

        if (any)
        {
            return {
                exports: any.bind(url.substring(0, url.lastIndexOf('/')))
            };
        }

        any = ajax(url);

        if (flags === false)
        {
            return { exports: any };
        }

        return {
            exports: new Function('data', [

                'var __k = jiac.classes;\n',
                'var color = jiac.color;\n\n',
                'with(data)\n{\n',
                'return ',
                jiac.htmlTemplate(any),
                '\n}\n\n//# sourceURL=', url

            ].join('')).bind(url.substring(0, url.lastIndexOf('/') + 1))
        };
    }



    // 相对路径转绝对路径
    jiac.absoluteUrl = absolute;

    
    // 加载模块
    jiac.loadModule = function (base, url, flags) {

        var ext = exts[url],
            any;

        if (ext)
        {
            url = ext[1];
            ext = ext[0];
        }
        else
        {
            if (ext = url.match(/(?!\.)\w+$/))
            {
                exts[url] = [ext = ext[0].toLowerCase(), url];
            }
            else
            {
                exts[url] = [ext = 'js', url += '.js'];
            }
        }

        url = absolute(base, url);

        if (any = modules[url])
        {
            return any.exports;
        }

        if (url.indexOf('{{language}}') >= 0)
        {
            languages[url] = ext;
            any = url.replace('{{language}}', jiac.language);
        }
        else
        {
            any = url;
        }

        if (any = handlers[ext])
        {
            return (modules[url] = any(url, flags)).exports;
        }

        return (modules[url] = {

            exports: cache[url] || ajax(url)
            
        }).exports;
    }



    // 注册模块
    jiac.module = function (url, content) {

        cache[absolute(global.base, url)] = content;
    }

    
    
    // 当前语言
    jiac.language = navigator.language || navigator.userLanguage || 'en-US';


    // 切换语言
    jiac.switchLanguage = function (language) {

        jiac.language = language;
        jiac.i18n = languages[language] || languages['en-US'];

        for (var key in languages)
        {
            var url = key.replace('{{language}}', language),
                data = ajax(url);

            switch (languages[key])
            {
                case '.js':
                    data = loadJs(data, url).exports;
                    break;

                case '.json':
                    data = data ? JSON.parse(text) : null;
                    break;
            }

            mixin(modules[key].exports, data);
        }
    }


    function mixin(target, source) {

        var value;

        for (var key in source)
        {
            if ((value = source[key]) && typeof value === 'object')
            {
                mixin(target[key] || (target[key] = {}), value);
            }
            else
            {
                target[key] = value;
            }
        }
    }



})(window);
