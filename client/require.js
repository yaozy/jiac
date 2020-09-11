
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


    // 相对url缓存
    var urls = create(null);

    // 扩展名缓存
    var exts = create(null);


    // 模块处理
    var handlers = create(null);


    // 默认版本号
    var version = ('' + Math.random()).replace('0.', '')





    function factory(base) {

        function require(url) {

            return jiac.loadModule(require.base, url);
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

		xhr.open('GET', url + '?v=' + version, false);

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


    handlers.js = function (url) {

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

            new Function(['require', 'exports', 'module'], any)(
                factory(url.substring(0, url.lastIndexOf('/') + 1)),
                module.exports,
                module);
        }

		return module;
    }


    handlers.json = function (url) {

        var text = cache[url] || ajax(url);

        return { 
            exports: text ? JSON.parse(text) : null 
        };
    }



    // 相对路径转绝对路径
    jiac.absoluteUrl = absolute;

    
    // 加载模块
    jiac.loadModule = function (base, url) {

        var ext = exts[url],
            any;

        if (ext)
        {
            url = ext[1];
            ext = ext[0];
        }
        else if (any = url.match(/\.json$|\.js$/))
        {
            exts[url] = [ext = any[0].substring(1), url];
        }
        else
        {
            exts[url] = [ext = 'js', url += '.js'];
        }

        url = absolute(base, url);

        if (any = modules[url])
        {
            return any.exports;
        }

        return (modules[url] = handlers[ext](url)).exports;
    }



    // 注册模块
    jiac.module = function (url, content) {

        cache[absolute(global.base, url)] = content;
    }



})(window);
