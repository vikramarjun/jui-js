/*
* Author:
*   xushengs@gmail.com
*   http://fdream.net/
* */
(function($) {
    // add to loaded module-list
    //$.register('array', '1.0.0.0');
	///<class>
    ///    <name>Array</name>
    ///    <summary>
    ///        扩展Array类。
    ///    </summary>
    ///</class>
    Array.implement({
        each: function(fn, bind) {
			///<summary>
            /// 对数组的每一项进行操作
            ///</summary>
            ///<param name="fn" type="function">要执行的方法，参数：(第几项，第几项的内容，数组自身)</param>
            ///<param name="bind" type="object">将函数作为这个对象的方法执行</param>
            ///<returns type="undefined" />
            for (var i = 0, l = this.length; i < l; i++) fn.call(bind, i, this[i], this);
        },

        contains: function(item, from) {
			///<summary>
            /// 检索数组中是否包括要查询的内容，找到返回内容的位置，没找到返回-1
            ///</summary>
            ///<param name="item" type="any">要查询的内容</param>
            ///<param name="from" type="">开始检索的位置</param>
            ///<returns type="int">找到返回内容的位置，没找到返回-1</returns>
            return this.indexOf(item, from) != -1;
        }
    });

    Array.alias('forEach', 'each');

})(JUI);