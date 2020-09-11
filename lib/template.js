;(function () {




    function parse(array, node, space) {

        var attributes = node.attributes,
            tagName = node.tagName,
            item,
            name,
            value,
            bindings,
            events,
            any;

        switch (tagName)
        {
            case 'Ref':
                array.push(space, '"Class": require("', node.getAttribute('src'), '")');
                node.removeAttribute('src');
                break;

            case 'Template':
                array.push(space, 'require("', node.getAttribute('src'), '")(', node.getAttribute('data') || node.getAttribute('d-data') || 'data', ')');
                return;

            case 'RictText':
                array.push(space, '"Class": "RichText",\n');
                array.push(space, '"text": \'', (node.innerHTML || node.textContent).replace(/[\r\n]\s*/g, '').replace(/'/g, '\\\''), '\'');
                node = null;
                break;

            default:
                array.push(space, '"Class": "', tagName, '"');
                break;
        }

        if (attributes && attributes[0])
        {
            for (var i = 0, l = attributes.length; i < l; i++)
            {
                item = attributes[i];
                name = item.nodeName;
                value = item.nodeValue;
                
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
            else if (/ContentControl|Button|Header|Button|ImageButton|IconButton/.test(tagName))
            {
                parseContent(array, node, space);
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


    function parseContent(array, node, space) {
        
        if (node.nextSibling)
        {
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
                        array.push(',\n', space, '"content": [');
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
        else if (node.nodeType === 1)
        {
            array.push(',\n', space, '\t"content": {\n');

            parse(array, node, space + '\t\t');

            array.push('\n', space, '\t}');
        }
        else
        {
            array.push(',\n', space, '"content": "', node.textContent, '"');
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



    
    module.exports = function (text) {

        var node = new DOMParser().parseFromString(text, 'text/xml').documentElement;
        var array = ['module.exports = function (data) {\n\n\nreturn {\n'];

        parse(array, node, '\t');

        array.push('\n};\n\n\n}');

        return array.join('');
    }


})();
