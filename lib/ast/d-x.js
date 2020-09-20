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
            case 1: // 属性
                // 以$开头则去掉$后原样输出, 如属性本身以$开头, 则需写两个$即$$
                if (value[0] === '$')
                {
                    values.push(value.substring(1));
                }
                else
                {
                    values.push(value, 'data.');
                }
                break;

            case 2: // 函数(只支持require等全局函数)
                values.push(value);
                break;

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
