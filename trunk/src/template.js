/*
* Author:
*   xushengs@gmail.com
*   http://fdream.net/
* */
(function($) {
    // add to loaded module-list

    ///<class>
    ///    <name>$.Template</name>
    ///    <summary>
    ///         模板处理类
    ///    </summary>
    ///    <include>$</include>
    ///</class>

    function escapeRegex(str) {
        return str.replace(/([-.*+?^${}()|[\]\/\\])/g, '\\$1');
    }

    var Template = function(options) {
        this.dom = options.dom || null;
        this.delimiters = {
            start: options.startTag || '<%',
            end: options.endTag || '%>'
        };
        this.delimiters.expression = this.delimiters.start + '=';
        this.tokenRegex = new RegExp('(' + escapeRegex(this.delimiters.start) + '=?)|(' + escapeRegex(this.delimiters.end) + ')', 'img');

        return this;
    };

    $.Native.initialize({
        name: 'Template',
        initialize: Template,
        protect: true
    });

    function scan(re, str, delimiters) {
        var result, ret = [], first_idx, last_idx = 0, first_bit, last_match = '';
        while (result = re.exec(str)) {
            first_idx = result.index;
            switch (last_match) {
                case delimiters.start:
                    ret.push(str.substring(last_idx, first_idx));
                    break;
                case delimiters.expression:
                    ret.push('__ret.push(' + str.substring(last_idx, first_idx) + ');');
                    break;
                default:
                    ret.push('__ret.push("' + str.substring(last_idx, first_idx).replace(/"/g, '\\"') + '");');
                    break;
            }
            last_match = result[0];
            last_idx = re.lastIndex;
        }
        if (last_idx < str.length - 1) {
            ret.push('__ret.push("' + str.substring(last_idx, str.length) + '\\n");');
        }
        return ret.join('');
    }

    function compile(re, tpl, delimiters) {
        var out = ['(function(){return function(context){ var __ret = [];with(context){'], i = 0, line,
        tpl = tpl.replace(/(^\s*<!--\s*[\r\n]*)|(^\s*-->\s*[\r\n]*)/gm, '').replace(/([\r\n]+)/mg, '');
        out.push(scan(re, tpl, delimiters));
        out.push('}return __ret.join("");};})();');
        return out.join('');
    }

    Template.implement({
        render: function(data, dom) {
            var d = $(dom || this.dom);
            var code = compile(this.tokenRegex, d.innerHTML, this.delimiters);
            this.process = window.eval(code);
            d.innerHTML = this.process(data);
        }
    });

    $.Template = Template;
})(JUI);