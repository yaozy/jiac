var jiac = Object.create(null);


(function (jiac) {



    // 全局require
    var global = window.require = factory(location.href.substring(0, location.href.lastIndexOf('/')));

	// 模块缓存
	var modules = jiac.modules = Object.create(null);

    // 源代码缓存
    var sources = jiac.sources = Object.create(null);

    // 多语言缓存
    var languages = jiac.languages = Object.create(null);

    // 文件对应版本号
    var versions = jiac.versions = Object.create(null);

    // 相对url缓存
    var urls = Object.create(null);

    // 扩展名缓存
    var exts = Object.create(null);



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


    function execute(url, ext, flags) {

        var text = sources[url] || ajax(url);
		
		switch (ext)
		{
            case '.css':
                loadCss(text);
                return { exports: text };

			case '.js':
                return loadJs(text, url, flags);

            case '.json':
                text = text ? JSON.parse(text) : null;
                return { exports: text };

            case '.html':
                if (flags === false)
                {
                    return { exports: text };
                }

                if (/^\s*</.test(text))
                {
                    text = jiac.template(text);
                }

                return { exports: template(url, text) };

			default:
                return { exports: text };
		}
    }

    function template(url, text) {

        var array = ['var __dirname = "' + url.substring(0, url.lastIndexOf('/') + 1) + '";\n',
            'var __k = jiac.classes;\n',
            'var color = jiac.color;\n\n',
            'with(data)\n{\n',
            'return ',
            text,
            '\n}\n\n//# sourceURL=', url
        ];

        return new Function('data', array.join(''));
    }


    function ajax(url) {

        var xhr = new XMLHttpRequest(),
            version = versions[url],
            text;

        if (!version)
        {
            version = [
                Math.random(),
                Math.random()
            ].join("").replace(/0./g, '')
        }

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


	function loadCss(text) {

        var dom = document.createElement('style'),
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
	}


	function loadJs(text, url, flags) {

        var module = { exports: {} };

        if (text)
        {
            text = text + '\n//# sourceURL=' + url;

            // 全局执行
            if (flags === false)
            {
                eval.call(window, module.exports.text = text);
            }
            else
            {
                new Function(['require', 'exports', 'module', 'modules'], text)(
                    factory(url.substring(0, url.lastIndexOf('/') + 1)),
                    module.exports,
                    module,
                    modules);
            }
        }

		return module;
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

        if (url.indexOf('{{language}}') >= 0)
        {
            languages[url] = ext;
            any = url.replace('{{language}}', jiac.language);
        }
        else
        {
            any = url;
        }

        return (modules[url] = execute(any, ext, flags)).exports;
    }


    // 缓存源代码
    jiac.cache = function (url, text) {

        if (text && typeof text === 'string')
        {
            sources[absolute(global.base, url)] = text;
        }
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
                data = sources[url] || ajax(url);

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



})(jiac);
