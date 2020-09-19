const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;


let scope = Object.create(null);

let positions = [];



scope = ['this', 'true', 'false', 'null', 'undefined', 'void', 'new', 'require', 'Math'];



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
                fixed = 'data.'; // 变量以data为前缀
                break;

            case 'callee':
                fixed = 'this.'; // 方法调用以this为前缀
                break;

            default:
                return;
        }

        var node = path.node;
        var name = node.name;

        // 以$开头的变量去掉'$'后原样输出, 如果本来变量以$开头, 需要写两个$即$$
        if (name[0] === '$')
        {
            positions.push('', node.start, node.end);
        }
        else if (scope.indexOf(name) < 0)
        {
            positions.push(fixed, node.start, node.end);
        }
    }
}



module.exports = function (expression) {

    var ast = parser.parse(expression);
    var list = positions;

    list.length = 0;

    traverse(ast, visitor);

    if (list.length < 1)
    {
        return expression;
    }

    var values = [];
    var last = expression.length;
    var start, fixed, value;

    for (var i = list.length; i--;)
    {
        start = list[i--];
        values.push(expression.substring(start, last));

        last = start;
        start = list[i--];
        fixed = list[i];

        value = expression.substring(start, last);

        if (fixed)
        {
            values.push(value, fixed);
        }
        else // 以$开头的去掉$后原样输出
        {
            values.push(value.substring(1));
        }

        last = start;
    }

    if (last > 0)
    {
        values.push(expression.substring(0, last));
    }

    return values.reverse().join('');
}


module.exports.scope = scope;
