(function($) {
    // add to loaded module-list
    $.register('loader', '1.0.0.0');

    var loading = {}, _source, cbIndex = 1, cbPrefix = 'jui_cb_';

    var Loader = function(source) {
        _source = source;
        return this;
    };

    $.Native.initialize({
        name: 'Loader',
        initialize: Loader,
        protect: true
    });

    function load(options) {
        options = options || _source || {};

        var src, charset, type = 'js', callback = $.empty, useParam, bind, cache;
        src = options.url;
        type = options.type;
        charset = options.charset;
        callback = options.callback;
        bind = options.bind;
        useParam = options.param;
        cache = options.cache;

        if (!src || src == '') {
            return;
        }

        try {
            // generate callback functions and add parameters to url
            if (useParam && callback) {
                $.Loader[cbPrefix + cbIndex] = function() {
                    callback.apply(bind, arguments);
                }
                if (src.indexOf('?') > -1) {
                    src = src + '&cb=JUI.Loader.' + cbPrefix + cbIndex;
                }
                else {
                    src = src + '?cb=JUI.Loader.' + cbPrefix + cbIndex;
                }
                if (!cache) {
                    src = src + '&r=' + Math.random();
                }
                cbIndex++;
            }

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

            if (!useParam && callback) {
                dom.onload = function() {
                    callback.apply(bind, [src, true]);
                    //callback(src, true);
                };

                dom.onerror = function() {
                    callback.apply(bind, [src, false]);
                    //callback(src, false);
                };

                dom.onreadystatechange = function() {
                    if (dom.readyState == 'loaded') {
                        callback.apply(bind, [src, true]);
                        //callback(src, true);
                    }
                }
            }

            loading[src] = dom;
            document.getElementsByTagName('head')[0].appendChild(dom);
        } catch (e) {
            callback(src, false);
        }
    }

    Loader.implement({
        load: function(list) {
            if (!list) {
                list = [_source];
            }
            else if ($.type(list) != 'array') {
                list = Array.prototype.slice.call(arguments, 0);
            }
            var i = 0, source;
            while (source = list[i++]) {
                load(source);
            }

            return this;
        },

        chain: function(list) {
            if ($.type(list) != 'array') {
                list = Array.prototype.slice.call(arguments, 0);
            }
            if (!list || list.length == 0) {
                return;
            }

            var source = list.shift(), self = this;
            cb = function(l, s) {
                s.callback(s.url);
                self.chain(l);
            };
            this.load({ url: source.url, type: source.type, callback: cb(list, source) });
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