const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;


let scope = Object.create(null);

let positions = [];



scope = ['this', 'scope'];



var visitor = {

    Identifier(path) {

        switch (path.key)
        {
            case 'left':
            case 'right':
            case 'id':
            case 'object':
            case 'expression':
            case 'argument':
                var node = path.node;

                if (scope.indexOf(node.name) < 0)
                {
                    positions.push(node.start, node.end);
                }
                break;

            case 'callee':
                var node = path.node;

                if (node.name !== 'require')
                {
                    positions.push(node.start, node.end);
                }
                break;
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
    var start;

    for (var i = list.length; i--;)
    {
        start = list[i--];
        values.push(expression.substring(start, last));

        last = start;
        start = list[i];

        values.push(expression.substring(start, last), 'this.');
        last = start;
    }

    return values.reverse().join('');
}


module.exports.scope = scope;
