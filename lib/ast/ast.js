const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;


const keywords = new Set('this,true,false,null,void,new'.split(','));



function createVisitor(scope, positions) {

    return {

        Identifier: function (path) {
    
            var node = path.node;
            var name = node.name;
    
            // 不处理关键字
            if (keywords.has(name))
            {
                return;
            }

            // 在作用域内
            if (scope.indexOf(name) >= 0)
            {
                positions.push(3, node.start, node.end);
                return;
            }

            switch (path.key)
            {
                case 'left':
                case 'right':
                case 'id':
                case 'object':
                case 'expression':
                case 'argument':
                    positions.push(1, node.start, node.end);
                    break;

                case 'callee':
                    positions.push(2, node.start, node.end);
                    break;
            }
        }
    }
}



module.exports = function (expression, scope) {

    var ast = parser.parse(expression);
    var positions = [];

    traverse(ast, createVisitor(scope, positions));

    return positions;
}
