(function($) {
    // add to loaded module-list
    $.register('loader', '1.0.0.0');

    var loading = {}, src, charset, type = 'js', callback = $.empty;

    function getOptions(options) {
        options = options || {};
        src = options.url;
        type = options.type;
        charset = options.charset;
        callback = options.callback;
    }

    var Loader = function(options) {
        getOptions(options);
        return this;
    };

    $.Native.initialize({
        name: 'Loader',
        initialize: Loader,
        protect: true
    });

    Loader.implement({
        load: function(options) {
            options && getOptions(options);

            if (!src || src == '') {
                return;
            }

            try {
                var dom;
                if (type == 'css') {
                    dom = document.createElement('link');
                    dom.rel = 'stylesheet';
                    dom.type = 'text/css';
                    dom.href = src;
                }
                else {
                    dom = document.createElement('script');
                    dom.src = src;
                    dom.type = 'text/javascript';
                }
                charset && (dom.charset = charset);
                if (callback) {
                    dom.onload = function() {
                        callback(src, true);
                    };

                    dom.onerror = function() {
                        callback(src, false);
                    };

                    dom.onreadystatechange = function() {
                        if (dom.readyState == 'loaded') {
                            callback(src, true);
                        }
                    }
                }
                loading[src] = dom;
                document.getElementsByTagName('head')[0].appendChild(dom);
            } catch (e) {
                callback(src, false);
            }

            return this;
        },

        cancel: function(src) {
            if (!loading[src]) {
                return;
            }

            document.removeChild(loading[src]);
            delete loading[src];
        }
    });

    $.Loader = Loader;
})(JUI);    