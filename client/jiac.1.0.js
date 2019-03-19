
(function (window) {



    var create = Object.create;


    // 全局变量
    var jiac = window.jiac = create(null);


    // 全局require
    var require = window.require = factory(location.href);

	// 模块缓存
	var cache = jiac.cache = create(null);

    // 注册的模块
    var modules = jiac.modules = create(null);

    // 多语言模块
    var languages = jiac.languages = create(null);

    // 相对url缓存
    var urls = create(null);

    // 扩展名缓存
    var exts = create(null);


    // 模块处理
    var handlers = create(null);



    // 默认版本号
    var version = ('' + Math.random()).replace('0.', '');


    // 文件对应版本号
    jiac.versions = create(null);




    function factory(base) {

        function require(url, flags) {

            return load(require.base, url, flags);
        }

        require.base = require.baseURL = base.substring(0, base.lastIndexOf('/'));
        require.runAsThread = runAsThread;

        return require;
    }


    function load(base, url, flags) {

        var ext = exts[url] || checkURL(url),
            any,
            fn;

        url = absolute(base, ext[1]);
        ext = ext[0];

        if (any = cache[url])
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

        if (fn = handlers[ext])
        {
            return (cache[url] = fn(any, flags)).exports;
        }

        return (cache[url] = {

            exports: modules[any] || ajax(any)
            
        }).exports;
    }
    

    function checkURL(url) {

        var ext;

        if (ext = url.match(/(?!\.)\w+$/))
        {
            return exts[url] = [ext[0].toLowerCase(), url];
        }

        return exts[url] = ['js', url + '.js'];
    }


    function absolute(base, url) {

        // 相对根目录
        if (url[0] === '/')
        {
            base = require.base;
            return base + (base[base.length - 1] === '/' ? url.substring(1) : url);
        }

        // 相对当前目录
        url = (base[base.length - 1] === '/' ? base : base + '/') + url;

        return urls[url] || (urls[url] = relative(url));
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

        return modules[url] = text;
    }


    // 作为线程运行
    function runAsThread(url) {

        var text;

        url = absolute(this.base, (exts[url] || checkURL(url))[1]);
        text = modules[url] || ajax(url);

        if (text)
        {
            return new Thread(require.base, this.base, text);
        }

        throw url + ' has no any code!';
    }


    handlers.css = function (url) {

        var text = modules[url] || ajax(url),
            dom = document.createElement('style'),
            color = jiac.color;  

        dom.setAttribute('type', 'text/css');  

        text = text.replace(/color-([\w-]+)/g, function (text, key) {

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

        if (any = modules[url])
        {
            if (typeof any === 'function')
            {
                any(factory(url), module.exports, module);
                return module;
            }
        }
        else if (!(any = ajax(url)))
        {
            return module;
        }

        any = any + '\n//# sourceURL=' + url;

        // 全局执行
        if (flags === false)
        {
            eval.call(window, any);
        }
        else
        {
            new Function(['require', 'exports', 'module'], any)(factory(url), module.exports, module);
        }

		return module;
    }


    handlers.json = function (url) {

        var text = modules[url] || ajax(url);

        return { 
            exports: text ? JSON.parse(text) : null 
        };
    }


    handlers.html = function (url, flags) {

        var any = modules[url];

        if (any)
        {
            if (typeof any === 'function')
            {
                return {
                    exports: any.bind(url.substring(0, url.lastIndexOf('/')))
                };
            }
        }
        else
        {
            any = ajax(url);
        }

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
    jiac.path = absolute;

    
    // 加载模块
    jiac.load = load;



    // 注册模块
    jiac.module = function (url, content) {

        modules[absolute(require.base, url)] = content;
    }


    // 缓存数据
    jiac.data = function (url, data) {

        cache[absolute(require.base, url)] = { exports: data };
    }

    
    
    // 当前语言
    jiac.language = navigator.language || navigator.userLanguage || 'en-US';


    // 切换语言
    jiac.switchLanguage = function (language) {

        var url, any;

        jiac.language = language;
        jiac.i18n = languages[language] || languages['en-US'];

        for (var key in languages)
        {
            url = key.replace('{{language}}', language);

            if (any = handlers[languages[key]])
            {
                any = any(url).exports;
            }
            else
            {
                any = modules[any] || ajax(any)
            }

            mixin(cache[key].exports, any);
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




    // 线程注入代码
    var inject = '' + function () {


        var create = Object.create;


        // 全局变量
        var jiac = self.jiac = create(null);


        // 全局require
        var require = factory(base[base.length - 1] === '/' ? base : base + '/');

        

        // 模块缓存
        var cache = jiac.cache = create(null);

        // 注册的模块
        var modules = jiac.modules = create(null);


        // 相对url缓存
        var urls = create(null);

        // 扩展名缓存
        var exts = create(null);


        // 模块处理
        var handlers = create(null);


            
        function factory(base) {

            function require(url, flags) {

                return load(require.base, url, flags);
            }

            require.base = require.baseURL = base.substring(0, base.lastIndexOf('/'));
            return require;
        }


        function load(base, url, flags) {

            var ext = exts[url] || checkURL(url),
                any;

            url = absolute(base, ext[1]);
            ext = ext[0];

            if (any = cache[url])
            {
                return any.exports;
            }

            if (any = handlers[ext])
            {
                return (cache[url] = any(url, flags)).exports;
            }

            return (cache[url] = {

                exports: modules[url] || ajax(url)
                
            }).exports;
        }
        

        function checkURL(url) {

            var ext;

            if (ext = url.match(/(?!\.)\w+$/))
            {
                return exts[url] = [ext[0].toLowerCase(), url];
            }

            return exts[url] = ['js', url + '.js'];
        }


        function absolute(base, url) {

            // 相对根目录
            if (url[0] === '/')
            {
                base = root;
                return base + (base[base.length - 1] === '/' ? url.substring(1) : url);
            }

            // 相对当前目录
            url = (base[base.length - 1] === '/' ? base : base + '/') + url;

            return urls[url] || (urls[url] = relative(url));
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

            return modules[url] = text;
        }


        handlers.js = function (url, flags) {

            var module = { exports: {} },
                any;

            if (any = modules[url])
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
                    eval.call(self, any);
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

            var text = modules[url] || ajax(url);

            return { 
                exports: text ? JSON.parse(text) : null 
            };
        }



        // 注册模块
        jiac.module = function (url, content) {

            modules[absolute(require.base, url)] = content;
        }


        // 缓存数据
        jiac.data = function (url, data) {

            cache[absolute(require.base, url)] = { exports: data };
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


        return require;

    };


    inject = inject.substring(inject.indexOf('{') + 1);
    inject = inject.substring(0, inject.lastIndexOf('}'));



    // 线程调用id
    var seed = 1;

    var versions;



    function Thread(root, base, text) {

        var list = ['var require = function (self, root, base, versions, version) {\n',
            inject, 
            '\n}(self, "', 
                root[root.length - 1] !== '/' ? root : root.slice(0, -1),  '", "', 
                base, '", ',
                versions || (versions = JSON.stringify(jiac.versions)), ', "',
                version,
            '");\n\n\n\n\n'];

        list.push(text);
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



})(window);

;(function () {




    function parse(array, node, space) {

        var attributes = node.attributes,
            tagName = node.tagName,
            item,
            name,
            value,
            bindings,
            styles,
            events,
            any;

        switch (tagName)
        {
            case 'R':
            case 'Ref':
            case 'Require':
            case 'Reference':
                array.push(space, '"Class": jiac.load(this, "', node.getAttribute('src'), '")');
                node.removeAttribute('src');
                break;

            case 'HTML':
            case 'HtmlControl':
                array.push(space, '"Class": __k.HtmlControl,\n');
                array.push(space, '"html": \'', (node.innerHTML || node.textContent).replace(/[\r\n]\s*/g, '').replace(/'/g, '\\\''), '\'');
                node = null;
                break;

            default:
                array.push(space, '"Class": __k.', tagName);
                break;
        }

        if (attributes && attributes[0])
        {
            for (var i = 0, l = attributes.length; i < l; i++)
            {
                item = attributes[i];
                name = item.nodeName;
                value = item.nodeValue;

                if (name === 'style')
                {
                    parseStyle(styles || (styles = []), value, space + '\t');
                    continue;
                }
                
                if (name[1] === '-')
                {
                    any = name[0];
                    name = name.substring(2);

                    // 传入的数据
                    if (any === 'd')
                    {
                        array.push(',\n', space, '"', name, '": ', value);
                        continue;
                    }

                    // 绑定
                    if (any === 'b')
                    {
                        if (bindings)
                        {
                            bindings.push(name, value);
                        }
                        else
                        {
                            bindings = [name, value];
                        }
                        
                        continue;
                    }

                    // 事件
                    if (any === 'e')
                    {
                        if (events)
                        {
                            events.push(name, value);
                        }
                        else
                        {
                            events = [name, value];
                        }

                        continue;
                    }
                }

                array.push(',\n', space, '"', name, '": "', value, '"');
            }

            if (styles)
            {
                array.push(',\n', space, '"style": {', styles.join(''));

                if (any = styles.bindings)
                {
                    array.push(styles[0] ? ',\n' : '', space, '\t"bindings": {\n', any.join(''), '\n', space, '\t}');
                }
                
                array.push('\n', space, '}');
            }

            if (bindings)
            {
                array.push(',\n', space, '"bindings": {');
                writeBindings(array, bindings, space + '\t');
                array.push('\n', space, '}');
            }

            if (events)
            {
                array.push(',\n', space, '"events": {');
                writeEvents(array, events, space + '\t');
                array.push('\n', space, '}');
            }
        }

        if (node && (node = node.firstChild))
        {
            if (tagName === 'Repeater')
            {
                parseTemplate(array, node, space);
            }
            else
            {
                parseChildren(array, node, space);
            }
        }
    }


    function parseTemplate(array, node, space) {

        do
        {
            if (node.nodeType === 1)
            {
                array.push(',\n', space, '\ttemplate: {\n');

                parse(array, node, space + '\t\t');

                array.push('\n', space, '\t}');

                return;
            }
        }
        while (node = node.nextSibling);
    }


    function parseChildren(array, node, space) {

        var flag;

        do
        {
            if (node.nodeType === 1)
            {
                if (flag)
                {
                    array.push(',');
                }
                else
                {
                    array.push(',\n', space, '"children": [');
                    flag = 1;
                }

                array.push('\n', space, '\t{\n');

                parse(array, node, space + '\t\t');

                array.push('\n', space, '\t}');
            }
        }
        while (node = node.nextSibling);

        if (flag)
        {
            array.push('\n', space, ']');
        }
    }


    function parseStyle(array, text, space) {

        var tokens = text.split(';'),
            token,
            index,
            name,
            flag;

        for (var i = 0, l = tokens.length; i < l; i++)
        {
            if ((token = tokens[i]) && (index = token.indexOf(':')) > 0)
            {
                name = token.substring(0, index);
               
                if (!(token = token.substring(index + 1)))
                {
                    continue;
                }

                if (flag)
                {
                    array.push(',');
                }
                else
                {
                    flag = 1;
                }

                array.push('\n', space, '"', name, '": ', '"' + token + '"');
            }
        }
    }


    function writeBindings(array, bindings, space) {

        var index = 0,
            name;

        while (name = bindings[index++])
        {
            if (index > 1)
            {
                array.push(',');
            }

            array.push('\n', space, '"', name, '": "', bindings[index++], '"');
        }
    }


    function writeEvents(array, events, space) {

        var index = 0,
            name;

        while (name = events[index++])
        {
            if (index > 1)
            {
                array.push(',');
            }

            array.push('\n', space, '"', name, '": data.', events[index++]);
        }
    }



    
    jiac.htmlTemplate = function (text) {

        var node = new DOMParser().parseFromString(text, 'text/xml').documentElement,
            array = ['{\n'];

        parse(array, node, '\t');

        array.push('\n};');

        return array.join('');
    }



})();
