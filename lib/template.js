const parseData = require('./ast/d-x');
const parseBinding = require('./ast/b-x');

let scopeData = [];
let scopeBinding = [];



function parse(array, node, space) {

    var attributes = node.attributes;
    var tagName = node.tagName.toLowerCase(); // 节点不区分大小写
    var nodes, scope;

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

        case 'databox':
        case 'modelbox':
            scope = [node.getAttribute('item') || '$item', node.getAttribute('index') || '$index'];

            if (scope[0][0] !== '$')
            {
                scope[0] = '$' + scope[0];
                console.error(tagName, ' item must use "$" to begin');
            }

            if (scope[1][0] !== '$')
            {
                scope[1] = '$' + scope[1];
                console.error(tagName, ' index must use "$" to begin');
            }

            // 添加作用域
            node.setAttribute('scope', tagName === 'databox' ? scopeData.join(',') : scopeBinding.join(''));
            // 直接穿透到default

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
            switch (tagName)
            {
                case 'databox':
                    try
                    {
                        scopeData.push(scope[0], scope[1]);
                        parseDataBox(array, nodes, space + '\t');
                    }
                    finally
                    {
                        scopeData.pop();
                        scopeData.pop();
                    }
                    break;

                case 'modelbox':
                    try
                    {
                        scopeBinding.push(scope[0], scope[1]);
                        parseChildren(array, nodes, space + '\t');
                    }
                    finally
                    {
                        scopeBinding.pop();
                        scopeBinding.pop();
                    }
                    break;

                default:
                    parseChildren(array, nodes, space + '\t');
                    break;
            }
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

                    array.push(space, '"', name.substring(2), '": ', parseData(value, scopeData));
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
            value = ' function ($pipe) { return ' + parseBinding(value, scopeBinding) + ' }';
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
            value = 'owner.' + value + '.bind(owner)';
        }

        array.push(space, '"', name, '": ', value);
    }
}


function getChildNodes(node) {

    var list, value;

    node = node.firstChild;

    do
    {
        if (node.nodeType === 1)
        {
            if (list)
            {
                list.push(node);
            }
            else
            {
                list = [node];
            }
        }
        else if (node.nodeType === 3 && (value = node.textContent) && (value = value.trim()))
        {
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


function parseDataBox(array, nodes, space) {

    var scope = scopeData;
    var last = scope.length - 2;
    var item = scope[last];
    var index = scope[last + 1];

    // 生成作用域变量
    scope = scope.slice(0, last);
    
    while (last--)
    {
        scope[last] = space + '    var ' + scope[last] + ' = __loop_scope[' + last + '];\n';
    }

    array.push(',\n', space, 'function (controls, __loop_data, __loop_scope) {\n',
        '\n',
        scope.join(''),
        '\n',
        space, '    for (var ', index, ' = 0, __loop_len = __loop_data.length; ', index, ' < __loop_len; ', index, '++)\n',
        space, '    {\n',
        space, '        var ', item, ' = __loop_data[', index, '];\n',
        '\n',
        space, '        this.loadTemplate(controls, __loop_scope, ', index, ', ', item);

    parseChildren(array, nodes, space + '\t\t\t');

    array.push('\n', space, '\t\t);\n',
        space, '    }\n',
        '\n',
        space, '    // end function\n',
        space, '}');
}



module.exports = function (text, file) {

    var node, array;

    try
    {
        console.log(new Date(), file);

        if ((node = text && new DOMParser().parseFromString(text, 'text/xml')) && 
            (node = node.documentElement))
        {
            array = ['module.exports = function (owner, data) {\n\n\nreturn (\n'];

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


