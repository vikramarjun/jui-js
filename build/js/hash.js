(function($) {
    // add to loaded module-list
    $.register('hash', '1.0.0.0');

    var Hash = function(key, value) {
        var obj = {};
        if ($.type(key) === 'string') {
            obj[key] = value;
        }
        else {
            obj = key;
        }

        if (obj && !obj.$family !== 'hash') {
            var proto = Hash.prototype;
            for (var p in proto) {
                obj[p] = proto[p];
            }
        }

        return obj;
    };

    $.Native.initialize({
        name: 'Hash',
        initialize: Hash,
        protect: true
    });

    Hash.implement({
        add: function(key, value) {
            if ($.type(key) !== 'string') {
                this.merge(key);
            }
            else {
                this[key] = value;
            }
            return this;
        },

        include: function(key, value) {
            if ($.type(key) !== 'string') {
                this.extend(key);
            }
            else {
                this[key] === undefined && (this[key] = value);
            }
            return this;
        },

        remove: function(key) {
            delete this[key];
            return this;
        },

        clear: function() {
            for (var k in this) {
                delete this[k];
            }

            return {};
        },

        extend: function(obj) {
            for (var k in obj) {
                (this[k] === undefined) && (this[k] = obj[k]);
            }

            return this;
        },

        merge: function(obj) {
            for (var k in obj) {
                this[k] = obj[k];
            }
            return this;
        },

        contains: function(key) {
            return this[key] !== undefined;
        },

        getKey: function(value) {
            for (var k in this) {
                if (this[k] == value) {
                    return k;
                }
            }

            return null;
        }
    });

    Hash.alias({ contains: 'has' });

    $.Hash = Hash;

})(JUI);