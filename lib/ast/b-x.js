const ast = require("./ast");



function computeScope(scope, value) {

    var times = 0;

    for (var i = scope.length; i--;)
    {
        // index
        if (scope[i--] === value)
        {
            return 'this.' + '$parent.'.repeat(times) + '$index';
        }

        // item
        if (scope[i] === value)
        {
            return 'this' + '.$parent'.repeat(times);
        }

        times++;
    }
}



module.exports = function (expression, scope, name) {

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
            case 1: // 属性(直接定位到顶层模型对象)
                values.push(value, 'this.$top.');
                break;

            case 2: // 函数
                values.push(value);
                break;

            case 3: // 作用域
                values.push(computeScope(scope, value));
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


