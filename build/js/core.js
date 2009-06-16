/*!
* Script:
*   Core.js
*   JUI(JavaScript User Interface) JavaScript Library v1.0.0
*
* License:
*	MIT-style license.
*
* Author:
*   xushengs@gmail.com
*   http://fdream.net/
*
* Copyright:
*   Copyright (c) 2009 Fdream
*
* Date: 
*   2009-06-15 16:08:20 +0800 (Mon, 15 Jun 2009)

* Revision: 
*   1
*/

(function() {

    var 
    window = this,
    // Map over jui in case of overwrite
	_jui = window.jui,
    // Map over the $ in case of overwrite
	_$ = window.$,

    jui = window.jui = window.$ = function(selector, context) {
        // TODO: init
    };

    jui.name = 'jui';
    jui.version = '1.0.0.0';

    var Native = {
        initialize: function(options) {
            options = options || {};
            var initialize = options.initialize;
            var legacy = options.legacy;
            var name = options.name || jui.name;
            var object = initialize || legacy || {};
            var protect = options.protect;

            object.constructor = this.initialize;
            object.type = name.toLowerCase();
            object.prototype.constructor = object;
            object.prototype.type = object.type;

            var add = function(obj, name, method, force) {
                if (!protect || force || !obj.prototype[name]) obj.prototype[name] = method;
                // if (generics) Native.genericize(obj, name, protect);
                return obj;
            };

            object.alias = function(a1, a2, a3) {
                if (typeof a1 == 'string') {
                    if ((a1 = this.prototype[a1])) return add(this, a2, a1, a3);
                }
                for (var a in a1) this.alias(a, a1[a], a2);
                return this;
            };

            object.genericize = function(a1, a2, a3) {
                // if (typeof a1 == 'string') return add(this, a1, a2, a3, tru);
                // for (var p in a1) add(this, p, a1[p], a2);
                return this;
            };

            object.implement = function(a1, a2, a3) {
                if (typeof a1 == 'string') return add(this, a1, a2, a3);
                for (var p in a1) add(this, p, a1[p], a2);
                return this;
            };
        },

        genericize: function(object, properties) {
            if ((!check || !object[property]) && typeof object.prototype[property] == 'function') object[property] = function() {
                var args = Array.prototype.slice.call(arguments);
                return object.prototype[property].apply(args.shift(), args);
            };
        },

        implement: function(object, properties) {
            for (var i = 0, l = objects.length; i < l; i++) objects[i].implement(properties);
        }
    };

    (function() {
        var natives = { 'Array': Array, 'Date': Date, 'Function': Function, 'Number': Number, 'RegExp': RegExp, 'String': String };
        for (var n in natives) Native.initialize({ name: n, initialize: natives[n], protect: true });

        //var types = { 'Boolean': Boolean, 'Native': Native, 'Object': Object };
        //for (var t in types) Native.typize(types[t], t);

        var generics = {
            'Array': ["concat", "indexOf", "join", "lastIndexOf", "pop", "push", "reverse", "shift", "slice", "sort", "splice", "toString", "unshift", "valueOf"],
            'String': ["charAt", "charCodeAt", "concat", "indexOf", "lastIndexOf", "match", "replace", "search", "slice", "split", "substr", "substring", "toLowerCase", "toUpperCase", "valueOf"]
        };
        for (var g in generics) {
            //for (var i = generics[g].length; i--; ) Native.genericize(window[g], generics[g][i], true);
        }

        String.implement('test', function() { return 'test'; });
    })();
})();