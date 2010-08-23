/*
* Author:
*   xushengs@gmail.com
*   http://fdream.net/
* */
(function ($) {
    // add to loaded module-list
    //$.register('ajax', '1.0.0.0');

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
        var xhr, vers = ['Microsoft.XMLHTTP', 'MSXML2.XMLHTTP.3.0', 'MSXML2.XMLHTTP'], i = 0, mx;

        try {
            return new XMLHttpRequest();
        }
        catch (e) {
            while (mx = vers[i++]) {
                try {
                    xhr = new ActiveXObject(mx);
                    return xhr;
                }
                catch (e2) { }
            }
        }

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

    ///<class>
    ///    <name>$.Ajax</name>
    ///    <summary>
    ///        Ajax类
    ///    </summary>
    ///</class>
    var Ajax = function (options) {
        ///<summary>
        /// 构造函数，创建一个新的Ajax对象，处理所有关于Ajax传输的问题。
        ///</summary>
        ///<param name="options" type="object">
        ///配置[可选]
        /// {
        ///		url:			[string,		Ajax的url][可选],
        ///		method:			[string,		GET还是POST方法][可选，(get)],
        ///		data:			[object,		要传递的数据][可选],
        ///		async:			[boolean,		是否为异步传输][可选，true],
        ///		encoding:		[string,		编码][可选，"utf-8"],
        ///		encode: 		[boolean,		是否转义编码][可选, true],
        ///		headers: 		[object,		浏览器头部][可选，{
        ///     'X-Requested-With': 'XMLHttpRequest',
        ///     'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
        ///     }]
        ///		timeout:		[int,			延时设置][可选，120],
        ///		cache:			[boolean,		是否缓存内容][可选，false],
        ///		link:			[string,		链接][可选，"ignore"],
        ///		type: 		    [string,		类型：支持xhr, xml, text, json][可选, 'xhr']
        ///		bind:			[object,		回调函数的this][可选]
        ///		onStateChange:	[function,		当Ajax状态改变时要调用的方法][可选],
        ///		onTimeout:		[function,		当Ajax超时时要调用的方法][可选],
        ///		onStart:		[function,		当Ajax开始时要调用的方法][可选],
        ///		onEnd:			[function,		当Ajax结束时要调用的方法][可选],
        ///		onSuccess:		[function,		当Ajax成功时要调用的方法][可选],
        ///		onFailure:		[function,		当Ajax失败时要调用的方法][可选],
        ///		onCancel:		[function,		当Ajax取消时要调用的方法][可选],
        /// }
        /// </param>
        /// <returns type="$.Ajax" />
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

        options = options || {};
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
        setHeader: function (name, value) {
            ///<summary>
            /// 设置单个头部，返回当前对象。
            ///</summary>
            ///<param name="name" type="string">键名</param>
            ///<param name="value" type="string">键值</param>
            ///<returns type="$.Ajax" />

            this.options.headers[name] = value;
            return this;
        },

        setHeaders: function (headers) {
            ///<summary>
            /// 设置头部组，返回当前对象。
            ///</summary>
            ///<param name="headers" type="object">头部组</param>
            ///<returns type="$.Ajax" />

            this.options.headers = mergeOptions(this.options.headers, headers);
            return this;
        },

        send: function (options) {
            ///<summary>
            /// 发送一个请求，返回当前对象。
            ///</summary>
            ///<param name="options" type="object">内容同$.Ajax构造函数</param>
            ///<returns type="$.Ajax" />

            switch (this.options.link) {
                case 'chain':
                    // TODO: implement it
                    break;
                case 'ignore':
                    return;
                    break;
                case 'cancel':
                    this.cancel();
                    break;
            }

            if ($.type(options) == 'string') {
                options = { url: options };
            }

            options = options || {};

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
                //_options.headers['Content-type'] = 'application/x-www-form-urlencoded' + encoding;
                _options.headers['Content-type'] = 'application/x-www-form-urlencoded';
            }

            // open
            this.xhr.open(method, url, _options.async);

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

            function stateChange() {
                if (this.timeouted) {
                    // when timeout, return the url of timeouted
                    _options.onTimeout.call(_options.bind, url);
                }

                if (this.xhr.readyState == 4) {
                    try {
                        clearTimeout(this.timeoutId);
                    }
                    catch (e) { }
                    this.runing = false;
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

            var onStateChange = (function (self) {
                return function () {
                    stateChange.call(self);
                }
            })(this);

            this.xhr.onreadystatechange = onStateChange;
            this.timeoutId = setTimeout((function (self) {
                return function () {
                    self.timeouted = true;
                    self.xhr.abort();
                    self.running = false;
                    self.xhr.onreadystatechange = $.empty;
                }
            })(this), _options.timeout * 1000);

            //fire start event
            _options.onStart.call(_options.bind, url);
            this.xhr.send(data);
            if (!_options.async) {
                onStateChange();
            }

            return this;
        },

        get: function (options) {
            ///<summary>
            /// GET方法发送请求完成后，onSuccess事件返回响应的XMLHttpRequest对象。
            ///</summary>
            ///<param name="options" type="object">内容同$.Ajax构造函数</param>
            ///<returns type="$.Ajax" />
            this.send(options, 'xhr');
            return this;
        },

        post: function (options) {
            ///<summary>
            /// POST方法发送，请求完成后，onSuccess事件返回响应的XMLHttpRequest对象。
            ///</summary>
            ///<param name="options" type="object">内容同$.Ajax构造函数</param>
            ///<returns type="$.Ajax" />
            this.send(options, 'xhr');
            return this;
        },

        json: function (options) {
            ///<summary>
            /// JSON请求，请求完成后，onSuccess事件返回响应的JSON对象。
            ///</summary>
            ///<param name="options" type="object">内容同$.Ajax构造函数</param>
            ///<returns type="$.Ajax" />
            this.send(options, 'json');
            return this;
        },

        text: function (options) {
            ///<summary>
            /// 文本请求，请求完成后，onSuccess事件返回响应的文本内容。
            ///</summary>
            ///<param name="options" type="object">内容同$.Ajax构造函数</param>
            ///<returns type="$.Ajax" />
            this.send(options, 'text');
            return this;
        },

        xml: function (options) {
            ///<summary>
            /// XML请求，请求完成后，onSuccess事件返回响应的XML文档。
            ///</summary>
            ///<param name="options" type="object">内容同$.Ajax构造函数</param>
            ///<returns type="$.Ajax" />
            this.send(options, 'xml');
            return this;
        },

        headers: function (options) {
            ///<summary>
            /// headers请求，请求完成后，onSuccess事件返回响应的headers。
            ///</summary>
            ///<param name="options" type="object">内容同$.Ajax构造函数</param>
            ///<returns type="$.Ajax" />
            this.send(options, 'headers');
            return this;
        },

        cancel: function () {
            ///<summary>
            /// 取消当前请求。
            ///</summary>
            ///<returns type="$.Ajax" />
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