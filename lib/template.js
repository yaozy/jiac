const ast = require('./ast');



function parse(array, node, space) {

    var attributes = node.attributes;
    var tagName = node.tagName.toLowerCase(); // 节点不区分大小写
    var nodes;

    switch (tagName)
    {
        case 'require':
            array.push(space, '[\n', space, '\t');
            array.push('require("', node.getAttribute('src'), '"),\n');
            node.removeAttribute('src');
            break;

        case 'template':
            array.push(space, 'require("', node.getAttribute('src'), '").apply(', 
                    node.getAttribute('data') || node.getAttribute('d-data') || 'this', ', ', 
                    node.getAttribute('args') || '[]',
                ')');
            return;

        default:
            array.push(space, '[\n', space, '\t');
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
        if (tagName === 'richtext')
        {
            array.push('\n', space, '"', (node.innerHTML || node.textContent).replace(/"/g, '\\"'), '"');
        }
        else if ((nodes = getChildNodes(node)) && nodes.length > 0)
        {
            parseChildren(array, nodes, space + '\t');
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
                if (value)
                {
                    if (flag)
                    {
                        array.push(',\n');
                    }
                    else
                    {
                        flag = true;
                    }

                    array.push(space, '"', name.substring(2), '": ', ast(value, 'data'));
                }
                break;

            // 绑定
            case 'b':
                if (value)
                {
                    name = name.substring(2);

                    if (bindings)
                    {
                        bindings.push(name, value);
                    }
                    else
                    {
                        bindings = [name, value];
                    }
                }
                break;

            // 事件
            case 'e':
                if (value)
                {
                    name = name.substring(2);

                    if (events)
                    {
                        events.push(name, value);
                    }
                    else
                    {
                        events = [name, value];
                    }
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

                if (name === 'if')
                {
                    array.push(space, '"if": ', value);
                }
                else
                {
                    array.push(space, '"', name, '": "', value.replace(/&quot;/g, '\\"'), '"');
                }
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

    var index = 0;
    var name, value;

    while (name = bindings[index++])
    {
        if (index > 1)
        {
            array.push(',\n');
        }

        value = bindings[index++];

        // 直接绑定字段
        if (/^[a-zA-Z$][\w$.]*$/.test(value))
        {
            value = '"' + value + '"';
        }
        else // 表达式绑定
        {
            value = ' function ($pipe) { return ' + ast(value, 'bind') + ' }';
        }

        array.push(space, '"', name, '": ', value);
    }
}


function parseEvents(array, events, space) {

    var index = 0,
        name,
        value;

    while (name = events[index++])
    {
        if (index > 1)
        {
            array.push(',\n');
        }

        value = events[index++];

        if (!/^this\./.test(value))
        {
            value = 'this.' + value + '.bind(this)';
        }

        array.push(space, '"', name, '": ', value);
    }
}



// for节点只能是父节点的唯一的子节点且至少包含一个子节点
var forError = 'for node must be child node only!';


function getChildNodes(node) {

    var list, value, isFor;

    node = node.firstChild;

    do
    {
        if (node.nodeType === 1)
        {
            if (isFor)
            {
                console.error(forError);
                return;
            }

            if (node.tagName === 'for')
            {
                if (list)
                {
                    console.error(forError);
                    return;
                }

                isFor = true;
            }

            if (list)
            {
                list.push(node);
            }
            else
            {
                list = [node];
            }
        }
        else if ((value = node.textContent) && (value = value.trim()))
        {
            if (isFor)
            {
                console.error(forError);
                return;
            }

            value = value
                .replace(/&quot;|"/g, '\\"')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&#39;/g, '\'');

            if (list)
            {
                list.push(value)
            }
            else
            {
                list = [value]
            }
        }
    }
    while (node = node.nextSibling);

    return list;
}


function parseChildren(array, nodes, space) {

    var length = nodes.length;
    var node;

    // 单独的文本节点
    if (length === 1)
    {
        node = nodes[0];

        if (typeof node === 'string')
        {
            return array.push(',\n', space, '"',  node, '"');
        }

        // 渲染for循环
        if (node.tagName === 'for')
        {
            return parseFor(array, node, space);
        }
    }

    // 子节点集合
    array.push(',\n', space, '[\n');

    for (var i = 0; i < length; i++)
    {
        if (i > 0)
        {
            array.push(',\n');
        }

        if (typeof (node = nodes[i]) === 'string')
        {
            array.push(space, '\t[\n', 
                space, '\t\t"text",\n', 
                space, '\t\tnull,\n', 
                space, '\t\t"', node, '"\n', space, '\t]');
        }
        else
        {
            parse(array, node, space + '\t');
        }
    }
    
    array.push('\n', space, ']');
}




function parseFor(array, node, space) {

    var list = node.getAttribute('list');
    var item = '$' + (node.getAttribute('item') || 'item');
    var index = '$' + (node.getAttribute('index') || 'index');
    var scope = ast.scope;

    if (!list)
    {
        array.push(space, '[]');
        console.error('for list can not be empty!');
        return;
    }

    list = ast(list, 'data');
    
    var nodes = getChildNodes(node);

    if (!nodes || nodes.length <= 0)
    {
        console.error('for node must has one sub node at least!');
        return;
    }

    array.push(',\n', space, '(function (__for_list) {\n',
        '\n',
        space, '    var __for_data = [];\n',
        '\n',
        space, '    for (var ', index, ' = 0, __for_len = __for_list.length; ', index, ' < __for_len; ', index, '++)\n',
        space, '    {\n',
        space, '        var ', item, ' = __for_list[', index, '];\n',
        '\n',
        space, '        __for_data.push.apply(__for_data');

    scope.push(item, index);

    try
    {
        parseChildren(array, nodes, space + '\t\t\t');
    }
    finally
    {
        scope.pop();
        scope.pop();
    }
        
    array.push(' || []);\n',
        space, '    }\n',
        '\n',
        space, '    return __for_data;\n',
        '\n',
        space, '}).call(this, ', list, ')');
}



module.exports = function (text) {

    var node, array;

    try
    {
        if ((node = text && new DOMParser().parseFromString(text, 'text/xml')) && 
            (node = node.documentElement))
        {
            array = ['module.exports = function (data) {\n\n\nreturn (\n'];

            parse(array, node, '\t');
    
            array.push('\n)\n\n\n}');

            return array.join('');
        }

        return '';
    }
    catch (e)
    {
        console.error(e);
    }
}


