/*
* Author:
*   xushengs@gmail.com
*   http://fdream.net/
* */
(function($) {
    // add to loaded module-list
    //$.register('cookie', '1.0.0.0');

    ///<class>
    ///    <name>$.Cookie</name>
    ///    <summary>
    ///         用来读写Cookie，提供常用的Cookie操作方法。
    ///    </summary>
    ///    <include>$</include>
    ///</class>

    var _options = {
        encode: false,
        decode: false,
        path: false,
        domain: false,
        duration: false,
        secure: false,
        document: document
    };

    function mergeOptions(options) {
        for (var p in options) {
            _options[p] = options[p];
        }
    }

    var Cookie = {
        write: function(key, value, options) {
            ///<summary>
            /// 写cookie，返回当前对象。
            ///</summary>
            ///<param name="key" type="string">KEY</param>
            ///<param name="value" type="string">VALUE</param>
            ///<param name="options" type="object">
            ///配置[可选]
            /// {
            ///     encode:     [boolean,   是否对value进行URI编码][可选],
            ///     domain:     [string,    域][可选],
            ///     path:       [string,    路径][可选],
            ///     duration:   [int,       过期时间(单位/天)][可选],
            ///     encode:     [boolean,   是否对value进行URI编码][可选]
            /// }
            ///</param>
            ///<returns type="$.Cookie" />
            mergeOptions(options);
            if (_options.encode) value = encodeURIComponent(value);
            if (_options.domain) value += '; domain=' + _options.domain;
            if (_options.path) value += '; path=' + _options.path;
            if (_options.duration) {
                var date = new Date();
                date.setTime(date.getTime() + _options.duration * 24 * 3600000);
                value += '; expires=' + date.toGMTString();
            }
            if (_options.secure) value += '; secure';
            _options.document.cookie = key + '=' + value;
            return this;
        },

        read: function(key, options) {
            ///<summary>
            /// 读cookie，返回读取的值。
            ///</summary>
            ///<param name="key" type="string">KEY</param>
            ///<param name="options" type="object">
            ///配置[可选]
            /// {
            ///     encode:     [boolean,   是否对value进行URI编码][可选],
            ///     domain:     [string,    域][可选],
            ///     path:       [string,    路径][可选],
            ///     duration:   [int,       过期时间(单位/天)][可选],
            ///     decode:     [boolean,   是否对value进行URI解码][可选]
            /// }
            ///</param>
            ///<returns type="String">返回读取的值，如果不存在，则返回null.</returns>
			mergeOptions(options);
            var value = _options.document.cookie.match('(?:^|;)\\s*' + key.replace(/([-.*+?^${}()|[\]\/\\])/g, '\\$1') + '=([^;]*)');
            // 默认decode，否则不decode
            if (_options.decode) {
                return (value) ? decodeURIComponent(value[1]) : null;
            }
            else {
                return (value) ? value[1] : null;
            }
        },

        remove: function(key, options) {
            ///<summary>
            /// 删除cookie
            ///</summary>
            ///<param name="key" type="string">KEY</param>
            ///<param name="options" type="object">
            ///配置[可选]
            /// {
            ///     encode:     [boolean,   是否对value进行URI编码][可选],
            ///     domain:     [string,    域][可选],
            ///     path:       [string,    路径][可选],
            ///     duration:   [int,       过期时间(单位/天)][可选],
            ///     encode:     [boolean,   是否对value进行URI解码][可选]
            /// }
            ///</param>
            ///<returns type="$.Cookie" />
            mergeOptions(options);
            _options.duration = -1;
            Cookie.write(key, '');
            return this;
        }
    };

    $.Cookie = Cookie;

})(JUI);