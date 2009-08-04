/**
* Script:
*   jui.js
*   JUI(JavaScript User Interface) JavaScript Library v1.0.0
*   Some codes are from Mootools, YUI, jQuery, Sizzle
*
* License:
*	MIT-style license.
*
* Author:
*   xushengs@gmail.com
*   http://fdream.net/
*
* Copyright:
*   Copyright (c) 2009, xushengs@gmail.com All Rights Reserved
*
* Date: 
*   2009-06-15 16:08:20 +0800 (Mon, 15 Jun 2009)
* 
* Modify:
*   2009-07-25 10:43:20 +0800 (Sat, 25 Jul 2009)
*
* Revision: 
*   1
*/

(function() {

    var 
    window = this,
    // Map over JUI in case of overwrite
	_JUI = window.JUI,
    // Map over the $ in case of overwrite
	_$ = window.$,

    $ = JUI = window.JUI = window.$ = function(selector) {
        // TODO: init
        return new Element(selector);
    };

    var Native = {
        initialize: function(options) {
            options = options || {};
            var initialize = options.initialize;
            var legacy = options.legacy;
            var name = options.name || jui.name;
            var object = initialize || legacy;
            var protect = options.protect;

            object.constructor = this.initialize;
            object.$family = name.toLowerCase();
            if (legacy && initialize) object.prototype = legacy.prototype;
            object.prototype.constructor = object;
            object.prototype.$family = object.$family;

            var add = function(obj, name, method, force) {
                if (!protect || force || !obj.prototype[name]) obj.prototype[name] = method;
                return obj;
            };

            object.alias = function(a1, a2, a3) {
                if (typeof a1 == 'string') {
                    if ((a1 = this.prototype[a1])) return add(this, a2, a1, a3);
                }
                for (var a in a1) this.alias(a, a1[a], a2);
                return this;
            };

            object.genericize = function(a1, a2) {
                if (typeof a1 == 'string') {
                    if ((!a2 || !this[a1]) && typeof this.prototype[a1] == 'function') this[a1] = function() {
                        var args = Array.prototype.slice.call(arguments);
                        return this.prototype[a1].apply(args.shift(), args);
                    };
                    return;
                }
                for (var i = 0; i < a1.length; i++) this.genericize(a1[i], a2);
                return this;
            };

            object.implement = function(a1, a2, a3) {
                if (typeof a1 == 'string') return add(this, a1, a2, a3);
                for (var p in a1) add(this, p, a1[p], a2);
                return this;
            };
        },

        genericize: function(object, properties) {
            object.genericize(properties);
        },

        implement: function(objects, properties) {
            for (var i = 0, l = objects.length; i < l; i++) objects[i].implement(properties);
        }
    };

    (function() {
        var natives = { 'Array': Array, 'Boolean': Boolean, 'Date': Date, 'Function': Function, 'Number': Number, 'RegExp': RegExp, 'String': String, 'JUI': $ };
        for (var n in natives) Native.initialize({ name: n, initialize: natives[n], protect: true });

        var generics = {
            'Array': ["concat", "indexOf", "join", "lastIndexOf", "pop", "push", "reverse", "shift", "slice", "sort", "splice", "toString", "unshift", "valueOf"],
            'String': ["charAt", "charCodeAt", "concat", "indexOf", "lastIndexOf", "match", "replace", "search", "slice", "split", "substr", "substring", "toLowerCase", "toUpperCase", "valueOf"]
        };
        for (var g in generics) {
            for (var i = generics[g].length; i--; ) Native.genericize(window[g], generics[g]);
        }
    })();

    $.name = 'jui';
    $.version = '1.0.0.0';
    $.ua = {};
    (function() {
        $.ua = {
            // Internet Explorer version number or 0.  Example: 6
            ie: 0,

            // Opera version number or 0.  Example: 9.2
            opera: 0,

            /**
            * Gecko engine revision number.  Will evaluate to 1 if Gecko 
            * is detected but the revision could not be found. Other browsers
            * will be 0.  Example: 1.8
            * <pre>
            * Firefox 1.0.0.4: 1.7.8   <-- Reports 1.7
            * Firefox 1.5.0.9: 1.8.0.9 <-- Reports 1.8
            * Firefox 2.0.0.3: 1.8.1.3 <-- Reports 1.8
            * Firefox 3 alpha: 1.9a4   <-- Reports 1.9
            * </pre>
            */
            gecko: 0,

            /**
            * AppleWebKit version.  KHTML browsers that are not WebKit browsers 
            * will evaluate to 1, other browsers 0.  Example: 418.9.1
            * <pre>
            * Safari 1.3.2 (312.6): 312.8.1 <-- Reports 312.8 -- currently the 
            *                                   latest available for Mac OSX 10.3.
            * Safari 2.0.2:         416     <-- hasOwnProperty introduced
            * Safari 2.0.4:         418     <-- preventDefault fixed
            * Safari 2.0.4 (419.3): 418.9.1 <-- One version of Safari may run
            *                                   different versions of webkit
            * Safari 2.0.4 (419.3): 419     <-- Tiger installations that have been
            *                                   updated, but not updated
            *                                   to the latest patch.
            * Webkit 212 nightly:   522+    <-- Safari 3.0 precursor (with native SVG
            *                                   and many major issues fixed).
            * Safari 3.0.4 (523.12) 523.12  <-- First Tiger release - automatic update
            *                                   from 2.x via the 10.4.11 OS patch
            *                                   
            * </pre>
            * http://developer.apple.com/internet/safari/uamatrix.html
            */
            webkit: 0,

            /**
            * The mobile property will be set to a string containing any relevant
            * user agent information when a modern mobile browser is detected.
            * Currently limited to Safari on the iPhone/iPod Touch, Nokia N-series
            * devices with the WebKit-based browser, and Opera Mini.  
            */
            mobile: null
        };

        var ua = navigator.userAgent, m;

        // Modern KHTML browsers should qualify as Safari X-Grade
        if ((/KHTML/).test(ua)) {
            $.ua.webkit = 1;
        }
        // Modern WebKit browsers are at least X-Grade
        m = ua.match(/AppleWebKit\/([^\s]*)/);
        if (m && m[1]) {
            $.ua.webkit = parseFloat(m[1]);

            // Mobile browser check
            if (/ Mobile\//.test(ua)) {
                $.ua.mobile = "Apple"; // iPhone or iPod Touch
            } else {
                m = ua.match(/NokiaN[^\/]*/);
                if (m) {
                    $.ua.mobile = m[0]; // Nokia N-series, ex: NokiaN95
                }
            }
        }

        if (!$.ua.webkit) { // not webkit
            // @todo check Opera/8.01 (J2ME/MIDP; Opera Mini/2.0.4509/1316; fi; U; ssr)
            m = ua.match(/Opera[\s\/]([^\s]*)/);
            if (m && m[1]) {
                $.ua.opera = parseFloat(m[1]);
                m = ua.match(/Opera Mini[^;]*/);
                if (m) {
                    $.ua.mobile = m[0]; // ex: Opera Mini/2.0.4509/1316
                }
            } else { // not opera or webkit
                m = ua.match(/MSIE\s([^;]*)/);
                if (m && m[1]) {
                    $.ua.ie = parseFloat(m[1]);
                } else { // not opera, webkit, or ie
                    m = ua.match(/Gecko\/([^\s]*)/);
                    if (m) {
                        $.ua.gecko = 1; // Gecko detected, look for revision
                        m = ua.match(/rv:([^\s\)]*)/);
                        if (m && m[1]) {
                            $.ua.gecko = parseFloat(m[1]);
                        }
                    }
                }
            }
        }
    })();

    // return type of an object
    $.type = function(obj) {
        return obj.$family ? obj.$family : typeof obj;
    };

    $.empty = function() { };

    // to resolve confilict problems
    $.noConfilict = function(deep) {
        window.$ = _$;

        if (deep) {
            window.JUI = _JUI;
        }

        return this;
    };

    var Element = function(selector) {
        var el = document.getElementById(selector);
        if (!el.$family && !(/^object|embed$/i).test(el.tagName)) {
            var proto = $.prototype;
            for (var p in proto) el[p] = proto[p];
        }
        return el;
    };

    Native.initialize({
        name: 'Element',
        legacy: $.empty,
        initialize: Element,
        protect: true
    });

    /**
    * whiz.js
    *   Whiz CSS Selector Engine
    * 
    * Version:
    *   1.0.0.0
    * 
    * Author:
    *   xushengs@gmail.com
    *
    */
    var whiz = function(selector, context, firstOnly) {
        if (!selector || typeof selector !== "string") {
            return [];
        }

        context = context || document;

        if (context.nodeType !== 1 && context.nodeType !== 9) {
            return [];
        }

        var lastIndex = 0,
            results = [],
            tag = /^((?:-?[_a-z]+[\w-]*)|\*)/i,
            quick = /^#?([\w-]+)/i,
            patterns = {
                //id: /^#?([\w-]+)/,
                klass: /^\.([\w-]+)/,
                attribute: /^\[([a-z]+\w*)+([~\|\^\$\*!]?=)?['"]?([^\]]*?)['"]?\]/i,
                pseudo: /^:([\-\w]+)(?:\(['"]?(.+)['"]?\))*/,
                combinator: /^\s*?((?:[>+~\s,])|$)/    // comma for multi-selectors
            };

        function query(s, contexts, firstOnly) {
            var m = null, tagResults = [], results = [], id = '', tagName = '*';

            // find by id
            m = s.match(quick);
            if (m) {
                id = m[1];
                results = [document.getElementById(id)];
            }

            // find tag
            m = s.match(tag);
            if (m) {
                tagName = m[1];
                s = s.substring(m[0].length);
            }

            for (var i = 0; i < contexts.length; i++) {

                tagResults = contexts[0].getElementsByTagName(tagName);

                for (var r in patterns) {
                    //m = patterns[r].exec(s);
                    m = s.match(patterns[r]);
                    if (m) {
                        switch (r) {
                            case 'klass':
                                alert(['class', m[1]]);
                                break;
                            case 'attribute':
                                alert(['attribute', m[1], m[2], m[3]]);
                                break;
                            case 'pseudo':
                                alert(['pseudo', m[1], m[2], m[3]]);
                                break;
                            case 'combinator':
                                alert(['combinator', m[1]]);
                                switch (m[1]) {
                                    case ' ':
                                        alert('space');
                                        break;
                                    case '>':
                                        break;
                                    case '+':
                                        break;
                                    case '~':
                                        break;
                                    case ',':
                                    default:
                                        break;
                                }
                                break;
                        }

                        s = s.substring(m[0].length);
                    }
                }
            }
        }

        function filter() {
        };

        query(selector, [context], firstOnly);
    };

    // for test only
    $.whiz = whiz;

    $.implement('hide', function() {
        this.style.display = 'none';
    });

})()