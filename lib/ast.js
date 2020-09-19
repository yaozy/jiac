const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;


const keywords = new Set('this,true,false,null,undefined,void,new,require,Math'.split(','));


let scope = [];

let positions = [];



var visitor = {

    Identifier(path) {

        var fixed;

        switch (path.key)
        {
            case 'left':
            case 'right':
            case 'id':
            case 'object':
            case 'expression':
            case 'argument':
                fixed = '.'; // 变量
                break;

            case 'callee':
                fixed = 'this.'; // 方法调用以this为前缀
                break;

            default:
                return;
        }

        var node = path.node;
        var name = node.name;

        // 不在作域内才处理
        if (scope.indexOf(name) < 0)
        {
            // 以$开头的变量去掉'$'后原样输出, 如果本来变量以$开头, 需要写两个$即$$
            if (name[0] === '$')
            {
                positions.push('', node.start, node.end);
            }
            else
            {
                positions.push(fixed, node.start, node.end);
            }
        }
    }
}



module.exports = function (expression, type) {

    var ast = parser.parse(expression);
    var list = positions;

    list.length = 0;

    traverse(ast, visitor);

    if (list.length < 1)
    {
        return expression;
    }

    var keys = keywords;
    var values = [];
    var last = expression.length;
    var start, fixed, value;

    // d- 动态渲染
    if (type === 'data')
    {
        for (var i = list.length; i--;)
        {
            start = list[i--];
            values.push(expression.substring(start, last));
    
            last = start;
            start = list[i--];
            fixed = list[i];
    
            value = expression.substring(start, last);
    
            if (keys.has(value))
            {
                values.push(value);
            }
            else if (fixed)
            {
                values.push(value, fixed === '.' ? 'data.' : fixed);
            }
            else // 以$开头的去掉$后原样输出
            {
                values.push(value.substring(1));
            }
    
            last = start;
        }
    }
    else // b- 数据绑定
    {
        for (var i = list.length; i--;)
        {
            start = list[i--];
            values.push(expression.substring(start, last));
    
            last = start;
            start = list[i--];
            fixed = list[i];
    
            value = expression.substring(start, last);
    
            if (keys.has(value))
            {
                values.push(value);
            }
            else if (fixed)
            {
                values.push(value, fixed === '.' ? 'this.' : fixed);
            }
            else // 以$开头
            {
                switch (value)
                {
                    case '$item':
                        value = 'this';
                        break;

                    case '$index':
                    case '$parent':
                    case '$top':
                        value = 'this.' + value;
                        break;
                }

                values.push(value);
            }
    
            last = start;
        }
    }


    if (last > 0)
    {
        values.push(expression.substring(0, last));
    }

    return values.reverse().join('');
}


module.exports.scope = scope;
