const ast = require("./ast");




module.exports = function (expression, scope, indexStack) {

    var positions = ast(expression, indexStack);
    var values = [];
    var last = expression.length;
    var start, value;

    for (var i = positions.length; i--;)
    {
        start = positions[i--];
        values.push(expression.substring(start, last));

        last = start;
        start = positions[i--];

        value = expression.substring(start, last);

        switch (positions[i])
        {
            case 1: // 属性
                values.push(value);
                break;

            case 2: // 函数
                values.push(value);
                break;

            case 3: // 索引作用域
                // 如果最后是模型索引则把索引改成$item.$index的形式
                var index = indexStack.lastIndexOf(value);

                if (indexStack[index + 1])
                {
                    values.push(scope[index] + '.$index');
                }
                else
                {
                    values.push(value);
                }
                break;
        }

        last = start;
    }

    if (last > 0)
    {
        values.push(expression.substring(0, last));
    }

    return values.reverse().join('');
}


