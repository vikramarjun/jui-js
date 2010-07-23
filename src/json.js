/*
* Author:
*   xushengs@gmail.com
*   http://fdream.net/
* */
(function($) {
    // add to loaded module-list
    //$.register('json', '1.0.0.0');

    var special = { '\b': '\\b', '\t': '\\t', '\n': '\\n', '\f': '\\f', '\r': '\\r', '"': '\\"', '\\': '\\\\' };

    function replaceChars(chr) {
        return special[chr] || '\\u00' + Math.floor(chr.charCodeAt() / 16).toString(16) + (chr.charCodeAt() % 16).toString(16);
    }

    ///<class>
    ///    <name>$.JSON</name>
    ///    <summary>
    ///        JSON工具类
    ///    </summary>
    ///    <include>$</include>
    ///</class>
    var JSON = {
        decode: function(s) {
            ///<summary>
            /// 将JSON字符串解码为js对象
            ///</summary>
            ///<param name="s" type="string">JSON字符串</param>
            ///<returns type="object" />
            if ($.type(s) != 'string' || !s.length) return null;
            //return eval('(' + s + ')');
            return (new Function("return " + s + ";"))();
        },

        encode: function(obj) {
            ///<summary>
            /// 将js对象编码为JSON字符串
            ///</summary>
            ///<param name="obj" type="string">js对象</param>
            ///<returns type="string" />
            var s = [];
            switch ($.type(obj)) {
                case 'undefined':
                    return 'undefined';
                    break;
                case 'null':
                    return 'null';
                    break;
                case 'number':
                case 'boolean':
                case 'date':
                case 'function':
                    return obj.toString();
                    break;
                case 'string':
                    return '"' + obj.replace(/[\x00-\x1f\\"]/g, replaceChars) + '"';
                    break;
                case 'array':
                    for (var i = 0, l = obj.length; i < l; i++) {
                        s.push($.JSON.encode(obj[i]));
                    }
                    return '[' + s.join(',') + ']';
                    break;
                case 'error':
                case 'object':
                    for (var p in obj) {
                        s.push('"' + p.replace(/[\x00-\x1f\\"]/g, replaceChars) + '"' + ':' + $.JSON.encode(obj[p]));
                    }
                    return '{' + s.join(',') + '}';
                    break;
                default:
                    return '';
                    break;
            }
        }
    }

    $.JSON = JSON;

})(JUI);