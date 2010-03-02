/*
* Author:
*   xushengs@gmail.com
*   http://fdream.net/
* */
(function($) {
    // add to loaded module-list
    $.register('array', '1.0.0.0');

    Array.implement({
        each: function(fn, bind) {
            for (var i = 0, l = this.length; i < l; i++) fn.call(bind, i, this[i], this);
        },

        contains: function(item, from) {
            return this.indexOf(item, from) != -1;
        }
    });

    Array.alias('forEach', 'each');

})(JUI);