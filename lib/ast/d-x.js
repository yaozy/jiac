const ast = require("./ast");


module.exports = function (expression, scope) {

    var positions = ast(expression, scope);
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
            case 1: // 属性无须处理, 原样输出
            case 2: // 函数无须处理, 原样输出
            case 3: // 作用域无须处理, 原样输出
                values.push(value);
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
