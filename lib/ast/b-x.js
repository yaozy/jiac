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
                var index = indexStack.lastIndexOf(value);

                // 如果是索引
                if (indexStack[index])
                {
                    index = scope[(index << 1) + 1];
                    values.push('("$index" in ' + index + ' ? ' + index + '.$index : ' + value + ')');
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


