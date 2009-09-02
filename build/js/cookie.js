(function($) {
    // add to loaded module-list
    $.register('cookie', '1.0.0.0');

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
            Cookie.write(key, '', mergeOptions({ duration: -1 }));
            return this;
        }
    };

    $.Cookie = Cookie;

})(JUI);