(function($) {
    // add to loaded module-list
    $.register('string', '1.0.0.0');

    String.implement({
        'trim': function(end) {
            ///<summary>
            /// 去掉字符串两端多余的空白字符
            ///</summary>
            ///<param name="end" type="String">左端或者右端</param>
            ///<returns type="STRING" />
            switch (end) {
                case 'l':
                case 'left':
                    return this.replace(/^\s+/, '');
                case 'r':
                case 'right':
                    return this.replace(/\s+$/, '');
                default:
                    return this.replace(/(^\s+)|(\s+$)/, '');
            }
        },
        startsWith: function(s) {
            ///<summary>
            /// 检查一个字符串是不是以某个字符串开头
            ///</summary>
            ///<param name="s" type="String">开始字符串</param>
            ///<returns type="BOOLEAN" />
            return (this.indexOf(s) == 0);
        },

        truncate: function(len, ae) {
            ///<summary>
            /// 按指定长度截取字符串
            /// 可以选择在截取字符串的后面添加或者不添加省略号（三个点）
            ///</summary>
            ///<param name="len" type="Number">要截取的字符串长度</param>
            ///<param name="ae" type="Boolean">true添加省略号，false不添加</param>
            ///<returns type="STRING" />
            var tl = 0, ts = [], tt = this.length;
            for (var i = 0; i < tt; i++) {
                if (this.charCodeAt(i) > 255) {
                    tl += 2;
                }
                else {
                    tl++;
                }
                //ts.push(this.charAt(i));

                if (tl > len) {
                    break;
                }
            }
            //return ae ? ts.join('') + '...' : ts.join('');
            return (ae && i < tt) ? this.substring(0, i) + '...' : this.substring(0, i);
        },

        escapseHTML: function() {
            ///<summary>
            /// 对字符中的HTML代码进行转义
            ///</summary>
            ///<returns type="STRING" />
            var htmlChars = ['&~&amp;', '<~&lt;', '>~&gt;'], r, s = this;
            for (var i = 0; i < htmlChars.length; i++) {
                r = htmlChars[i].split('~');
                s = s.replace(new RegExp(r[0], 'g'), r[1]);
            }

            return s;
        },

        unescapseHTML: function() {
            ///<summary>
            /// 反转义字符中的HTML代码
            ///</summary>
            ///<returns type="STRING" />
            var htmlChars = ['&~&amp;', '<~&lt;', '>~&gt;'], r, s = this;
            for (var i = htmlChars.length - 1; i >= 0; i--) {
                r = htmlChars[i].split('~');
                s = s.replace(new RegExp(r[1], 'g'), r[0]);
            }
            return s;
        },

        format: function() {
            ///<summary>
            /// 格式化一个字符串，替换其中用大括号包含的数字及大括号，类似C#的format
            /// 如用第一个参数替换{0}
            ///</summary>
            ///<param name="values..." type="String">相关参数</param>
            ///<returns type="STRING" />
            var s = this;
            for (var i = 0; i < arguments.length; i++) {
                s = s.replace(new RegExp("\\{" + i + "\\}", "g"), arguments[i]);
            }
            return s;
        },

        formatBy: function(obj, funs) {
            ///<summary>
            /// 用对象格式化一个字符串
            /// 可以对格式化的字符中进行指定的函数替换或者截取
            ///</summary>
            ///<param name="obj" type="object">用来替换格式的对象</param>
            ///<param name="funs" type="object">相应的替换函数</param>
            ///<returns type="STRING" />
            funs = funs || {};
            return this.replace(/\$\{([^\}]+)\}/g, function(a, b) {
                var c = b.split(':');
                var d = c[0].split('|');
                if (d.length == 1) {
                    if (d[0] in obj) return c[1] ? obj[d[0]].truncate(c[1].toInt()) : obj[d[0]];
                } else {
                    var f = d[1].trim();
                    if ((f in funs) && (d[0] in obj)) {
                        var r = funs[f](obj[d[0]]);
                        return c[1] ? r.truncate(c[1].toInt()) : r;
                    }
                }
                return a;
            })
        }
    });

})(JUI);