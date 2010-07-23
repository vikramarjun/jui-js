(function($) {

    var objs = [], cache = {};

    $.Element && objs.push($.Element);
    $.Window && objs.push($.Window);

    function contains(arr, item) {
        var l = arr.length;
        while (l) {
            if (arr[l--] == item) {
                return true;
            }
        }
        return false;
    }

    /*
    * Data.js     
    * */
    $.Native.implement(objs, {
        cache: function(name, value) {
            ///<summary>
            /// 存储或者读取数据
            ///</summary>
            ///<param name="name" type="String">
            ///   要存储的数据的名称
            ///</param>
            ///<param name="value" type="Object">
            ///   [可选]要存储的数据的值，
            ///   若不提供，则读取已存储的对应的数据。
            ///</param>
            ///<returns type="Object" />

            var uid = $.getUid(this);

            // Only generate the data cache if we're
            // trying to access or manipulate it
            if (name && !cache[uid]) {
                cache[uid] = {};
            }

            // Prevent overriding the named cache with undefined values
            if (value !== undefined) {
                cache[uid][name] = value;
                return value;
            }

            // Return the named cache data, or the ID for the element
            return name ? cache[uid][name] : uid;
        },

        erase: function(name) {
            ///<summary>
            /// 清除存储的数据
            ///</summary>
            ///<param name="name" type="String">
            ///   [可选]要删除的数据的名称，
            ///   若不提供，则删除存储的所有数据。
            ///</param>
            ///<returns type="$.Window" />

            var uid = $.getUid(this);

            // If we want to remove a specific section of the element's data
            if (name) {
                if (cache[uid]) {
                    // Remove the section of cache data
                    delete cache[uid][name];

                    // If we've removed all the data, remove the element's cache
                    name = "";

                    for (name in cache[uid])
                        break;

                    (!name) && this.erase();
                }

                // Otherwise, we want to remove all of the element's data
            } else {
                // Completely remove the data cache
                delete cache[uid];
            }

            return this;
        }
    });

    /**
    * Event.js
    * */
    $.Native.implement(objs, {
        addEvent: function(type, fn, bind, same) {
            ///<summary>
            /// 添加事件
            ///</summary>
            ///<param name="type" type="String">事件类型，不带前面的on</param>
            ///<param name="fn" type="Fucntion">事件处理函数</param>
            ///<param name="bind" type="Object">事件处理函数中this指向的对象</param>
            ///<param name="same" type="Boolean">是否允许重复添加完全相同的事件</param>
            ///<returns type="$.Element" />
            var events = this.cache('events') || this.cache('events', {});
            bind = bind ? bind : this;

            events[type] = events[type] || { keys: [], values: [] };
            if (!same && contains(events[type].keys, fn)) {
                return this;
            }

            var defn = function(e) {
                if ($.Event) {
                    e = new $.Event(e);
                }
                fn.call(bind, e);
            };

            if (type == 'unload') {
                var old = defn;
                defn = function() {
                    self.removeListener('unload', defn);
                    old();
                };
            }

            if (this.addEventListener) {
                this.addEventListener(type, defn, false);
            }
            else {
                this.attachEvent('on' + type, defn);
            }

            events[type].keys.push(fn);
            events[type].values.push(defn);

            return this;
        },

        removeEvent: function(type, fn) {
            ///<summary>
            /// 添加事件
            ///</summary>
            ///<param name="type" type="String">事件类型，不带前面的on</param>
            ///<param name="fn" type="Fucntion">
            ///   [可选]事件处理函数，如果不提供则删除所有该类型的事件
            ///</param>
            ///<returns type="$.Window" />

            var events = this.cache('events');
            if (!events || !events[type]) {
                return this;
            }

            if (!fn) {
                // remove all events of this type
                var i = 0, fns = events[type].keys;
                while (fn = fns[i++]) {
                    this.removeEvent(type, fn);
                }
                delete events[type];

                type = "";
                for (type in events) {
                    break;
                }

                if (!type) {
                    this.erase();
                }
                else {
                    this.cache('events', events);
                }

                return this;
            }

            var pos = -1, i = 0, f;
            while (f = events[type].keys[i]) {
                if (f == fn) {
                    pos = i;
                    break;
                }
                i++;
            }
            if (pos == -1) {
                return this;
            }

            events[type].keys.splice(pos, 1)
            fn = events[type].values.splice(pos, 1)[0];
            if (this.removeEventListener) {
                this.removeEventListener(type, fn, false);
            }
            else {
                this.detachEvent('on' + type, fn);
            }

            return this;
        },

        addEvents: function(events) {
            ///<summary>
            /// 一次性添加多个事件
            ///</summary>
            ///<param name="events" type="Object">
            ///   一个以事件类型为键（key），以事件处理函数为值（value）的hash对象
            ///</param>
            ///<returns type="$.Window" />

            for (var type in events) {
                this.addEvent(type, events[type]);
            }

            return this;
        },

        removeEvents: function(events) {
            ///<summary>
            /// 一次性删除多个事件
            ///</summary>
            ///<param name="events" type="Object">
            ///   [可选]一个以事件类型为键（key），以事件处理函数为值（value）的hash对象；
            ///   如果此参数为一个事件类型，这删除该类型的所有事件；
            ///   如不提供此参数，则删除所有事件。
            ///</param>
            ///<returns type="$.Window" />

            if ($.type(events) == 'object') {
                for (var type in events) {
                    this.removeEvent(type, events[type]);
                }
                return this;
            }

            var attached = this.cache('events');
            if (!attached) {
                return this;
            }

            if (!events) {
                for (var type in attached) {
                    this.removeEvent(type);
                }
                this.erase('events');
            }
            else {
                this.removeEvent(events);
            }
            return this;
        },

        fireEvent: function(type, args, delay) {
            ///<summary>
            /// 添加事件
            ///</summary>
            ///<param name="type" type="String">事件类型，不带前面的on</param>
            ///<param name="args" type="Array">要传递给事件处理函数的参数</param>
            ///<param name="delay" type="Number">延迟触发事件的时间</param>
            ///<returns type="$.Window" />

            var events = this.cache('events');
            if (!events || !events[type]) {
                return this;
            }

            var i = 0, fns = events[type].keys, fn, ret, self = this;
            while (fn = fns[i++]) {
                ret = function(f) {
                    return function() {
                        f.apply(self, args);
                    }
                };
                setTimeout(ret(fn), delay);
            }

            return this;
        }
    });
})(JUI);