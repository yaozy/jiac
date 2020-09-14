;(function () {



    var error = typeof console !== 'undefined' && console.error || function () {};



    function parse(array, node, space) {

        var attributes = node.attributes;
        var tagName = node.tagName;

        array.push(space, '[\n', space, '\t');

        switch (tagName)
        {
            case 'Ref':
            case 'ref':
                array.push('require("', node.getAttribute('src'), '"),\n');
                node.removeAttribute('src');
                break;

            case 'Template':
            case 'template':
                array.push('require("', node.getAttribute('src'), '")(', node.getAttribute('data') || node.getAttribute('d-data') || 'data', '),\n');
                return;

            default:
                array.push('"', tagName, '",\n');
                break;
        }

        if (attributes && attributes[0])
        {
            array.push(space, '\t{\n');

            parseAttributes(array, attributes, space + '\t\t');
            array.push('\n', space, '\t}');
        }
        else
        {
            array.push(space, '\tnull')
        }

        if (node.firstChild)
        {
            // 富文本框直接解析html内容
            if (/richtext/i.test(tagName))
            {
                array.push('\n', space, '"', (node.innerHTML || node.textContent).replace(/"/g, '\\"'), '"');
            }
            else
            {
                parseChildren(array, node.firstChild, space + '\t');
            }
        }

        array.push('\n', space, ']');
    }


    function parseAttributes(array, attributes, space) {

        var item, name, value, bindings, events, flag;

        for (var i = 0, l = attributes.length; i < l; i++)
        {
            item = attributes[i];
            name = item.nodeName;
            value = item.nodeValue;
            
            switch (name[1] === '-' && name[0])
            {
                // 传入的数据
                case 'd':
                    if (flag)
                    {
                        array.push(',\n');
                    }
                    else
                    {
                        flag = true;
                    }

                    array.push(space, '"', name.substring(2), '": ', value);
                    break;

                // 绑定
                case 'b':
                    name = name.substring(2);

                    if (bindings)
                    {
                        bindings.push(name, value);
                    }
                    else
                    {
                        bindings = [name, value];
                    }
                    break;

                // 事件
                case 'e':
                    name = name.substring(2);

                    if (events)
                    {
                        events.push(name, value);
                    }
                    else
                    {
                        events = [name, value];
                    }
                    break;

                default:
                    if (flag)
                    {
                        array.push(',\n');
                    }
                    else
                    {
                        flag = true;
                    }

                    array.push(space, '"', name, '": "', value.replace(/&quot;/g, '\\"'), '"');
                    break;
            }
        }

        if (bindings)
        {
            if (flag)
            {
                array.push(',\n');
            }
            else
            {
                flag = true;
            }

            array.push(space, '"bindings": {\n');
            parseBindings(array, bindings, space + '\t');
            array.push('\n', space, '}');
        }

        if (events)
        {
            if (flag)
            {
                array.push(',\n');
            }

            array.push(space, '"events": {\n');
            parseEvents(array, events, space + '\t');
            array.push('\n', space, '}');
        }
    }


    function parseBindings(array, bindings, space) {

        var index = 0,
            name;

        while (name = bindings[index++])
        {
            if (index > 1)
            {
                array.push(',\n');
            }

            array.push(space, '"', name, '": "', bindings[index++], '"');
        }
    }


    function parseEvents(array, events, space) {

        var index = 0,
            name;

        while (name = events[index++])
        {
            if (index > 1)
            {
                array.push(',\n');
            }

            array.push(space, '"', name, '": ', events[index++]);
        }
    }


    function parseChildren(array, node, space) {

        var list, value;

        do
        {
            if (node.nodeType === 1)
            {
                (list || (list = [])).push(node);
            }
            else if ((value = node.textContent) && (value = value.trim()))
            {
                value = value
                    .replace(/&quot;|"/g, '\\"')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&nbsp;/g, ' ')
                    .replace(/&amp;/g, '&')
                    .replace(/&#39;/g, '\'');

                (list || (list = [])).push(value);
            }
        }
        while (node = node.nextSibling);

        if (!list)
        {
            return;
        }

        var length = list.length;

        // 单独的文本节点
        if (length === 1 && typeof list[0] === 'string')
        {
            array.push(',\n', space, '"',  list[0], '"');
        }
        else // 子节点集合
        {
            array.push(',\n', space, '[\n');

            for (var i = 0; i < length; i++)
            {
                if (i > 0)
                {
                    array.push(',\n');
                }

                if (typeof (value = list[i]) === 'string')
                {
                    array.push(space, '\t[\n', 
                        space, '\t\t"text",\n', 
                        space, '\t\tnull,\n', 
                        space, '\t\t"', value, '"\n', space, '\t]');
                }
                else
                {
                    parse(array, value, space + '\t');
                }
            }
            
            array.push('\n', space, ']');
        }
    }


    
    module.exports = function (text) {

        var node, array;

        try
        {
            if ((node = text && new DOMParser().parseFromString(text, 'text/xml')) && 
                (node = node.documentElement))
            {
                array = ['module.exports = function (scope) {\n\n\nreturn (\n'];

                parse(array, node, '\t');
        
                array.push('\n)\n\n\n}');

                return array.join('');
            }

            return '';
        }
        catch (e)
        {
            error(e);
        }
    }


})();



