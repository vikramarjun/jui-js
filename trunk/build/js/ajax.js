/*
* Author:
*   xushengs@gmail.com
*   http://fdream.net/
* */
(function($) {
    // add to loaded module-list
    $.register('ajax', '1.0.0.0');

    function mergeOptions(o, n) {
        for (var p in n) {
            o[p] = n[p];
        }

        return o;
    }

    function objToQueryString(obj) {
        var s = [];
        for (var p in obj) {
            s.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
        }
        return s.join('&');
    }

    function getXHR() {
        var xhr, vers = [window.XMLHttpRequest, "MSXML2.XMLHTTP", "Microsoft.XMLHTTP"], i = 0, mx;
        while (mx = vers[i++]) {
            try {
                xhr = new ActiveXObject(mx);
                return xhr;
            }
            catch (e) { }
        }

        try {
            return new XMLHttpRequest();
        }
        catch (e) { }

        throw 'can not initialize XMLHttpRequest';
    }

    function parseHeaders(xhr) {
        var headerText = xhr.getAllResponseHeaders(),
            headers = {},
            lines = headerText.split('\n'),
            i = 0,
            line;

        while (line = lines[i++]) {
            if (line.length == 0) {
                continue;
            }
            
            var pos = line.indexOf(':'),
                name = line.substring(0, pos).replace(/^\s*|\s*$/, ''),
                value = line.substring(pos + 1).replace(/^\s*|\s*$/, '');
                
            headers[name] = value;
        }

        return headers;
    }

    var Ajax = function(options) {
        var _options = {
            url: null,
            method: 'GET',
            data: null,
            async: true,
            encoding: 'utf-8',
            encode: true,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
            },
            timeout: 120,
            cache: false,
            link: 'ignore',
            type: 'xhr',    // supports xhr, xml, text, json
            bind: null,     // the object of 'this' referer to in callback
            onStateChange: $.empty,
            onTimeout: $.empty,
            onStart: $.empty,
            onEnd: $.empty,
            onSuccess: $.empty,
            onFailure: $.empty,
            onCancel: $.empty
        };

        if (options.headers) {
            options.headers = mergeOptions(_options.headers, options.headers);
        }
        _options = mergeOptions(_options, options);

        this.options = _options;
        this.xhr = getXHR();
        this.running = false;
        this.timeoutId = null;
        this.timeouted = false;

        return this;
    };

    $.Native.initialize({
        name: 'Ajax',
        initialize: Ajax,
        protect: true
    });

    Ajax.implement({
        setHeader: function(name, value) {
            this.options.headers[name] = value;
            return this;
        },

        setHeaders: function(headers) {
            this.options.headers = mergeOptions(this.options.headers, headers);
            return this;
        },

        send: function(options) {
            if (options.headers) {
                options.headers = mergeOptions(this.options.headers, options.headers);
            }
            this.options = mergeOptions(this.options, options);
            if (arguments.length == 2 && typeof arguments[1] == 'string') {
                this.options.type = arguments[1];
            }

            var _options = this.options;

            // process parameters
            var data = _options.data, url = _options.url, method = _options.method.toUpperCase(), qm = false;

            if (!url || url == '') {
                throw 'url is empty';
            }

            this.running = true;

            qm = url.indexOf('?') > -1;

            data = objToQueryString(data);
            if (data != '' && method == 'GET') {
                url = url + (qm ? '&' : (qm = true, '?')) + data;
                data = null;
            }
            if (!_options.cache) {
                url = url + (qm ? '&' : '?') + new Date().getTime();
            }

            // encode
            if (_options.encode && method == 'POST') {
                var encoding = (_options.encoding) ? '; charset=' + _options.encoding : '';
                options.headers['Content-type'] = 'application/x-www-form-urlencoded' + encoding;
            }

            // set headers
            var hs = _options.headers;
            for (var h in hs) {
                try {
                    this.xhr.setRequestHeader(h, hs[h]);
                }
                catch (e) {
                    // fire exception event
                }
            }

            // open
            this.xhr.open(method, url, _options.async);

            function stateChange() {
                if (this.timeouted) {
                    //alert('timeouted');  // timeout event
                    // when timeout, return the url of timeouted
                    _options.onTimeout.call(_options.bind, url);
                }

                if (this.xhr.readyState == 4) {
                    try {
                        clearTimeout(this.timeoutId);
                    }
                    catch (e) { }
                    this.status = this.xhr.status;
                    try {
                        if (_options.type == 'header' || _options.type == 'headers') {
                            _options.onSuccess.call(_options.bind, parseHeaders(this.xhr));
                        }
                        else {
                            if (this.xhr.status == 200) {
                                //alert('ok');  // return ok
                                var ret = this.xhr;
                                switch (_options.type) {
                                    case 'text':
                                    case 'html':
                                        ret = this.xhr.responseText;
                                        break;
                                    case 'json':
                                        ret = window['eval']('(' + this.xhr.responseText + ')');
                                        break;
                                    case 'xml':
                                        ret = this.xhr.responseXML;
                                        break;
                                }
                                _options.onSuccess.call(_options.bind, ret);
                            }
                            else {
                                //alert(this.xhr.status);   // on failed
                                // when failed, return status code
                                _options.onFailure.call(_options.bind, this.xhr.status);
                            }
                        }
                    }
                    catch (e) {
                        //alert('failed');
                        // when failed, return status code
                        _options.onFailure.call(_options.bind, -1);
                    }
                    //alert('ended');
                    _options.onEnd.call(_options.bind, url);
                }

                _options.onStateChange(this.xhr, url);
            }

            var onStateChange = (function(self) {
                return function() {
                    stateChange.call(self);
                }
            })(this);

            this.xhr.onreadystatechange = onStateChange;
            this.timeoutId = setTimeout((function(self) {
                return function() {
                    self.timeouted = true;
                    self.xhr.abort();
                    self.running = false;
                    self.xhr.onreadystatechange = $.empty;
                }
            })(this), _options.timeout);

            //fire start event
            _options.onStart.call(_options.bind, url);
            this.xhr.send(data);
            if (!_options.async) {
                onStateChange();
            }

            return this;
        },

        get: function(options) {
            this.send(options, 'xhr');
        },

        post: function(options) {
            this.send(options, 'xhr');
        },

        json: function(options) {
            this.send(options, 'json');
        },

        text: function(options) {
            this.send(options, 'text');
        },

        xml: function(options) {
            this.send(options, 'xml');
        },

        headers: function(options) {
            this.send(options, 'headers');
        },

        cancel: function() {
            if (!this.running) {
                return this;
            }

            this.running = false;
            this.xhr.abort();
            this.xhr.onreadystatechange = $.empty;
            //this.xhr = getXHR();
            return this;
        }
    });

    $.Ajax = Ajax;
})(JUI);