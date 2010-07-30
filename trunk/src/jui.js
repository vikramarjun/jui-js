 /**
 *
 * Script:
 *   jui.js
 *   JUI(JavaScript User Interface) JavaScript Library
 *
 * Version: 
 *   1.0.2
 *
 * License:
 *	MIT-style license.
 *
 * Author:
 *   xushengs@gmail.com
 *   http://fdream.net/
 *
 * Thanks to:
 *   Yahoo! YUI Team & contributors,
 *   Valerio Proietti & MooTools contributors, 
 *   John Resig & jQuery contributors,
 *
 * */

(function() {

    var 
    window = this,
    // Map over JUI in case of overwrite
	_JUI = window.JUI,
    // Map over the $ in case of overwrite
	_$ = window.$,
    // global unique id
	_uid = 1,
    // name of uid property
    _expando = '_JUI_' + new Date,

    ///<class>
    ///    <name>$.Window</name>
    ///    <summary>
    ///         核心类，提供基础框架和方法。
    ///    </summary>
    ///    <include></include>
    ///</class>

    $ = JUI = window.JUI = window.$ = function(selector, context) {
        ///<summary>
        /// 根据选择器获取元素
        ///</summary>
        ///<param name="selector" type="String">选择器</param>
        ///<param name="context" type="$.Element">要查找的上下文</param>
        ///<returns type="$.Element" />
        if (selector == window) {
            return $.Window ? new $.Window(selector) : window;
        }

        if ($.Element) {
            return new $.Element(selector, false);
        }

        return document.getElementById(selector);
    };

    var Native = {
        initialize: function(options) {
            options = options || {};
            var initialize = options.initialize;
            var legacy = options.legacy;
            var name = options.name || JUI.name;
            var object = initialize || legacy;
            var protect = options.protect;
            var afterImplement = options.afterImplement || function() { };

            object.constructor = this.initialize;
            object.$family = { name: name.toLowerCase() };
            if (legacy && initialize) {
                object.prototype = legacy.prototype;
            }
            object.prototype.constructor = object;
            object.prototype.$family = object.$family;

            var add = function(obj, name, method, force) {
                if (!protect || force || !obj.prototype[name]) obj.prototype[name] = method;
                afterImplement.call(obj, name, method);
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
            object && object.genericize(properties);
        },

        implement: function(objects, properties) {
            var l = objects.length;
            while (l--) {
                objects[l].implement(properties);
            }
        }
    };

    $.Native = Native;

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

    $.name = 'jui';         // name of framework
    $.version = '1.0.2.0';  // current version of framework

    /**
    * return type of an object
    * 
    * @obj
    *    the object you want to do type test
    * */
    $.type = function(obj) {
        ///<summary>
        /// 获取对象的方法
        ///</summary>
        ///<param name="style" type="Object">对象</param>
        ///<returns type="string" />
        if (obj == undefined) return false;
        if (obj.$family) return (obj.$family.name == 'number' && !isFinite(obj)) ? false : obj.$family.name;
        if (obj.nodeName) {
            switch (obj.nodeType) {
                case 1: return 'element';
                case 3: return (/\S/).test(obj.nodeValue) ? 'textnode' : 'whitespace';
            }
        } else if (typeof obj.length == 'number') {
            if (obj.callee) return 'arguments';
            else if (obj.item) return 'collection';
        }
        return typeof obj;
    };

    /**
    * just a empty function
    *
    * */
    $.empty = function() { };

    /**
    * to resolve confilict problems
    *
    *  @deep:
    *    true to resolve JUI confilict
    * */
    $.noConfilict = function(deep) {
        ///<summary>
        /// 使JUI与其它不冲突
        ///</summary>
        ///<returns type="$" />
        window.$ = _$;

        deep && (window.JUI = _JUI);

        return this;
    };

    /*
    * 类继承的实现
    * */
    $.extend = function(child, parent) {
        ///<summary>
        /// 类继承的实现
        ///</summary>
        ///<param name="child" type="Object">子对象</param>
        ///<param name="parent" type="Object">父对象</param>
        ///<returns type="Object" />
        if (!parent) {
            throw 'Failed! Inherit from a null object';
        }

        var pp = parent.prototype,
            F = function() { };
        F.prototype = pp;
        var ext = new F();
        child.prototype = ext;
        ext.constructor = child;
        child.superclass = pp;

        // 如果没有构造函数，则指定一个
        if (parent != Object && pp.constructor == Object.prototype.constructor) {
            pp.constructor = parent;
        }

        return child;
    };

    /**
    * return current timestamp
    *
    * */
    $.now = function() {
        ///<summary>
        /// 返回当前时间的Time Stamp
        ///</summary>
        ///<returns type="Number" />
        return +new Date;
    };

    /**
    * return a global unique id of an element
    *
    * */
    $.getUid = (window.ActiveXObject) ? function(node) {
        return (node[_expando] || (node[_expando] = [_uid++]))[0];
    } : function(node) {
        return node[_expando] || (node[_expando] = _uid++);
    };

})();