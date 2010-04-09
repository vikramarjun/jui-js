/*
* Author:
*   xushengs@gmail.com
*   http://fdream.net/
* */
(function($) {
    // add to loaded module-list
    //$.register('hash', '1.0.0.0');

	///<class>
    ///    <name>$.Hash</name>
    ///    <summary>
    ///         哈希类。
    ///    </summary>
    ///    <include>$|JUI|Core</include>
    ///</class>

    var Hash = function(key, value) {
			///<summary>
        	/// 构造函数，创建一个新的$.Hash对象。
        	///</summary>
            ///<param name="name" type="String">
            ///   1. 要存储的数据的键名
            ///   2. 以键名为属性，键值为值的对象
            ///</param>
            ///<param name="value" type="Object">
            ///   [可选]要存储的数据的值，
            ///</param>
            ///<returns type="$.Hash" />
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
            ///<summary>
            /// 增加一个元素（键名不存在则新建）
            ///</summary>
            ///<param name="key" type="object">
			/// 1 (string) 键名
			/// 2 (object) OBJECT
			///</param>
            ///<param name="value" type="object">VALUE</param>
            ///<returns type="$.Hash" />
            if ($.type(key) !== 'string') {
                this.merge(key);
            }
            else {
                this[key] = value;
            }
            return this;
        },

        include: function(key, value) {
			///<summary>
            /// 增加一个元素（键名不存在则放弃）
            ///</summary>
            ///<param name="key" type="object">
			/// 1 (string) 键名
			/// 2 (object) OBJECT
			///</param>
            ///<param name="value" type="object">VALUE</param>
            ///<returns type="$.Hash" />
            if ($.type(key) !== 'string') {
                this.extend(key);
            }
            else {
                this[key] === undefined && (this[key] = value);
            }
            return this;
        },

        remove: function(key) {
            ///<summary>
            /// 删除一个元素
            ///</summary>
            ///<param name="key" type="object">KEY</param>
            ///<returns type="$.Hash" />
            delete this[key];
            return this;
        },

        clear: function() {
            ///<summary>
            /// 清除所有元素
            ///</summary>
            ///<param name="key" type="object">KEY</param>
            ///<returns type="$.Hash" />
            for (var k in this) {
                delete this[k];
            }
            return this;
        },

        extend: function(obj) {
			///<summary>
            /// 合并Hash（键名不存在则放弃）
            ///</summary>
            ///<param name="obj" type="object">OBJECT</param>
            ///<returns type="$.Hash" />
            for (var k in obj) {
                (this[k] === undefined) && (this[k] = obj[k]);
            }

            return this;
        },

        merge: function(obj) {
			///<summary>
            /// 合并Hash（键名不存在则新建）
            ///</summary>
            ///<param name="obj" type="object">OBJECT</param>
            ///<returns type="$.Hash" />
            for (var k in obj) {
                this[k] = obj[k];
            }
            return this;
        },

        contains: function(key) {
			///<summary>
            /// 是否定义键名
            ///</summary>
            ///<param name="key" type="object">KEY</param>
            ///<returns type="Object" />
            return this[key] !== undefined;
        },

        getKey: function(value) {
			///<summary>
            /// 用内容查找键名
            ///</summary>
            ///<param name="value" type="object">VALUE</param>
            ///<returns type="string" />
            ///<returns type="null" />
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