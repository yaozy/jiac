const parseData = require('./ast/d-x');
const parseBinding = require('./ast/b-x');



let scopeStack = [];
let indexStack = [];



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
            array.push(space, 'require("', node.getAttribute('src'), '")($owner, ', 
                    node.getAttribute('data') || node.getAttribute('d:data') || '$data', ', ', 
                    node.getAttribute('model') || node.getAttribute('d:model') || '$model',
                ')');
            return;

        case 'databox':
            scope = [
                node.getAttribute('index') || '$index', 
                node.getAttribute('item') || '$item'
            ];

            if (scope[0][0] !== '$')
            {
                scope[0] = '$' + scope[0];
                console.error(tagName, ' index must use "$" to begin');
            }

            if (scope[1][0] !== '$')
            {
                scope[1] = '$' + scope[1];
                console.error(tagName, ' item must use "$" to begin');
            }

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
            if (tagName === 'databox')
            {
                try
                {
                    scopeStack.push(scope[0], scope[1]);
                    indexStack.push(scope[0], node.getAttribute('type') === 'model');

                    parseDataBox(array, nodes, space + '\t');
                }
                finally
                {
                    scopeStack.pop();
                    scopeStack.pop();

                    indexStack.pop();
                    indexStack.pop();
                }
            }
            else
            {
                parseChildren(array, nodes, space + '\t');
            }
        }
    }

    array.push('\n', space, ']');
}


function parseAttributes(array, attributes, space) {

    var item, name, value, pipe, bindings, events, flag;

    for (var i = 0, l = attributes.length; i < l; i++)
    {
        item = attributes[i];
        name = item.nodeName;
        value = item.nodeValue;

        switch (name[1] === ':' && name[0])
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

                    pipe = checkPipe(value);
                    value = pipe[0];
            
                    if (pipe = pipe[1])
                    {
                        value = '$owner.pipe("' + pipe + '")(' + value + ')'
                    }

                    array.push(space, '"', name.substring(2), '": ', value);
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


function checkPipe(value, index) {

    var index = value.indexOf('|', index);

    if (index < 0)
    {
        return [value, ''];
    }

    try
    {
        parseData(value.substring(0, index), []);

        // 解析成功则此前为表达式, 此后为pipe
        return [value.substring(0, index).trim(), value.substring(index + 1).trim()];
    }
    catch (e)
    {
        // 失败则继续找下一个|
        return checkPipe(value, index + 1);
    }
}


function parseBindings(array, bindings, space) {

    var index = 0;
    var name, value, pipe;

    while (name = bindings[index++])
    {
        if (index > 1)
        {
            array.push(',\n');
        }
        
        pipe = checkPipe(bindings[index++]);
        value = parseBinding(pipe[0], scopeStack, indexStack);

        if (name === 'onchange')
        {
            array.push(space, '"', name, '":  function (value) { ', value, ' = value; }');
        }
        else
        {
            if (pipe = pipe[1])
            {
                value = '$pipe("' + pipe + '")(' + value + ');'
            }
    
            array.push(space, '"', name, '":  function (', pipe ? '$pipe' : '', ') { return ', value, ' }');
        }
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
            value = '$owner.' + value + '.bind($owner)';
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

    var scope = scopeStack;
    var last = scope.length - 2;
    var index = scope[last];
    var item = scope[last + 1];

    // 生成作用域变量
    scope = scope.slice(0, last);
    
    while (last--)
    {
        scope[last] = space + '\tvar ' + scope[last] + ' = __data_scope[' + last + '];\n';
    }

    array.push(',\n', space, 'function (template, __data_list, __data_scope) {\n',
        scope.length > 0 ? '\n' : '',
        scope.join(''),
        '\n',
        space, '\tfor (var ', index, ' = 0, __data_length = __data_list.length; ', index, ' < __data_length; ', index, '++)\n',
        space, '\t{\n',
        space, '\t\t// 添加作用域解决循环变量绑定变化的问题\n',
        space, '\t\t(function () {\n\n',
        space, '\t\tvar ', item, ' = __data_list[', index, '];\n',
        '\n',
        space, '\t\ttemplate(', index, ', ', item, ',\n');

    if (nodes.length > 1)
    {
        var message = 'databox node can only include one child node!';

        console.error(message);
        array.push(space, '\t\t\t["text", null, "', message, '"]');
    }
    else
    {
        parse(array, nodes[0], space + '\t\t\t');
    }

    array.push('\n', space, '\t\t);\n\n',
        space, '\t\t})();\n',
        space, '\t}\n',
        '\n',
        space, '\t// end function\n',
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
            array = ['module.exports = function ($owner, $data, $model) {\n\n',
                'if (!$owner) throw new Error("template must input $owner argument! file: ', file.replace(/\\/g, '\\\\'), '")\n\n',
                'return (\n'];

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


