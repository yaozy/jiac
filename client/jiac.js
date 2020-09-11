
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

        any = url;

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



})(window);

jiac.Thread = (function () {



    var seed = 1;

    var versions;



    var inject = '' + function () {


        var create = Object.create;


        // 全局变量
        var jiac = create(null);


        // 全局require
        var global = jiac.require = factory(base);

        

        // 模块缓存
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

        // 传入的版本号
        versions = versions ? JSON.parse(versions) : {};

        
        
        function factory(base) {

            function require(url, flags) {
    
                return load(require.base, url, flags);
            }
    
            require.base = require.baseURL = base;
            return require;
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
                return root + url;
            }
    
            // 相对当前目录
            url = (base[base.length - 1] === '/' ? base : base + '/') + url;

            return urls[url] || (urls[url] = relative(url));
        }


        function ajax(url) {

            var xhr = new XMLHttpRequest(),
                text;
  
            xhr.open('GET', url + '?v=' + (versions[url] || version), false);
    
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


        function load(base, url, flags) {

            var ext = exts[url],
                any;

            if (ext)
            {
                url = ext[1];
                ext = ext[0];
            }
            else
            {
                if (ext = url.match(/\.\w+$/))
                {
                    exts[url] = [ext = ext[0].toLowerCase(), url];
                }
                else
                {
                    exts[url] = [ext = '.js', url += '.js'];
                }
            }

            url = absolute(base, url);

            if (any = modules[url])
            {
                return any.exports;
            }

            if (any = handlers[ext])
            {
                return (modules[url] = any(url, flags)).exports;
            }
    
            return (modules[url] = {
    
                exports: cache[url] || ajax(url)
                
            }).exports;
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


        
        function reply(uuid, value, e) {

            self.postMessage(JSON.stringify([uuid, value, e]));
        }
        

        self.addEventListener('message', function (event) {
            
            var target = this,
                data = event.data,
                uuid = data.uuid,
                method = data.method,
                index = 0,
                list = method.split('.'),
                name,
                fn;

            try
            {
                name = list.pop();

                while (target && (fn = list[index++]))
                {
                    target = target[fn];
                }

                if (target && (fn = target[name]))
                {
                    list = data.args || [];

                    if (data.async)
                    {
                        list.push(function (value, e) {

                            reply(uuid, value, e);
                        });

                        fn.apply(target, list);
                    }
                    else
                    {
                        try
                        {
                            reply(uuid, fn.apply(target, list));
                        }
                        catch (e)
                        {
                            reply(uuid, null, e);
                        }
                    }
                }
                else
                {
                    reply(uuid, null, 'not support method "' + method + '"!');
                }
            }
            catch (e)
            {
                reply(uuid, null, e);
            }
        });


        return global;

    };


    inject = inject.substring(inject.indexOf('{') + 1);
    inject = inject.substring(0, inject.lastIndexOf('}'));


    

    function Thread(root, base, url) {

        var list = ['var require = function (self, root, base, versions) {\n',
            inject, 
            '\n}(self, "', 
                root[root.length - 1] !== '/' ? root : root.slice(0, -1),  '", "', 
                base, '", "',
                versions || (versions = JSON.stringify(jiac.versions)),
            '");\n\n\n\n\n'];

        if (typeof url === 'string')
        {
            list.push('require("' + url + '", false);');
        }
        else
        {
            list.push('' + url);
        }

        list = [list.join('')];

        this.queue = [];
        this.worker = new Worker(URL.createObjectURL(new Blob(list)));
        this.worker.onmessage = onmessage.bind(this);
    }

    
    
    function onmessage(event) {

        var data;

        if (data = event.data)
        {
            var queue = this.queue,
                index = 0,
                uuid = (data = JSON.parse(data))[0],
                item;

            while (item = queue[index])
            {
                if (item === uuid)
                {
                    queue[index + 1].call(this, data[1], data[2]);
                    queue.splice(index, 2);
                    return;
                }

                index += 2;
            }
        }
    }


    Thread.prototype.exec = function (method, args, callback, async) {

        if (method)
        {
            var uuid = seed++;

            this.queue.push(uuid, callback);

            this.worker.postMessage({
                uuid: uuid,
                method: method,
                args: args,
                async: async
            });
        }
    }


    Thread.prototype.terminate = function () {

        this.worker.terminate();
    }



    return Thread;
    


})();
