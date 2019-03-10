const uglify = require("uglify-js").minify;



module.exports = function (text, options) {

    options = options || {};
    // options.fromString = true;
    options.output = options.output || { max_line_len: 10240000 };

    text = uglify(text, options);

    if (text.error)
    {
        throw text.error;
    }

    text = text.code;

    if (options.advanced)
    {
        text = compress(text);
    }

    if (options.copyright)
    {
        text = options.copyright + '\r\n\r\n\r\n\r\n' + text;
    }

    if (options.advanced)
    {
        text = compress(text);
    }

    return text;
}



function compress(text) {
    
    let tokens = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
        length = tokens.length,
        keys = [], //关键字集合
        weight_keys = Object.create(null), //关键字权重
        map = Object.create(null), //关键字映射
        values = [],
        cache;
    
    //抽取关键字并计数
    text.replace(/([a-zA-Z0-9]+)|[^a-zA-Z0-9]+/g, function (text, key) {
       
        values.push(text);
        
        if (key)
        {
            weight_keys[key] = (weight_keys[key] || 0) + 1;
        }
    });
    
    //计算关键字权重
    for (let key in weight_keys)
    {
        if ((cache = key.length) < 3 || weight_keys[key] > 1)
        {
            //单字符提升权重
            if (cache === 1)
            {
                cache = 2;
            }
            
            keys.push(key);
            weight_keys[key] *= cache;
        }
    }
    
    //最多不能超过两个token的长度
    if (keys.length > length * length)
    {
        console.warn('wran: too long(tokens:' + keys.length + ' max:' + (length * length) + '), can not compress!');
        return text;
    }
    
    //按权重重新排序
    keys.sort((a, b) => {
       
        return weight_keys[b] - weight_keys[a];
    });
    
    //处理关键字映射
    for (let i = keys.length - 1; i >= 0; i--)
    {
        map[keys[i]] = i < length ? tokens[i] : tokens[(i - length) / length | 0] + tokens[i % length];
    }
    
    //按顺序转换
    for (let i = values.length - 1; i >= 0; i--)
    {
        if (cache = map[values[i]])
        {
            values[i] = cache;
        }
    }
    
    //处理掉转义字符及单引号
    cache = values.join('').replace(/\\/g, '\\\\').replace(/\'/g, '\\\'');
    
    return "eval(function(){"
            + "var c='" + cache + "',"
                + "k='" + keys.join("|") + "'.split('|'),"
                + "t='" + tokens + "'.split(''),"
                + "l=" + length + ","
                + "m=Object.create?Object.create(null):{};"
            + "for(var i=k.length-1;i>=0;i--){"
                + "m[i<l?t[i]:t[(i-l)/l|0]+t[i%l]]=k[i]"
            +"}"
            + "return c.replace(/[a-zA-Z0-9]+/g,function(t){"
                + "return m[t]||t"
            + "})"
        + "}())";
}
