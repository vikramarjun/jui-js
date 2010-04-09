/*
* Author:
*   xushengs@gmail.com
*   http://fdream.net/
* */
(function($) {
    // add to loaded module-list
    //$.register('window', '1.0.0.0');

    ///<class>
    ///    <name>$.Window</name>
    ///    <summary>
    ///         提供封装好window对象，并提供常用的DOM操作方法。
    ///    </summary>
    ///    <include>$</include>
    ///</class>

    var Window = function(win) {
        if (win && !win.$family) {
            var proto = Window.prototype;
            for (var p in proto) {
                win[p] = proto[p];
            }
        }
        return win;
    };

    $.Native.initialize({
        name: 'Window',
        legacy: window.Window ? window.Window : null,
        initialize: Window,
        afterImplement: function(property, value) {
            window[property] = Window.prototype[property] = value;
        }
    });

    /**
    * window.dimension.js
    * */
    Window.implement({
        dimension: function(sz) {
            ///<summary>
            /// 设置或者获取窗口大小
            ///</summary>
            ///<param name="style" type="Object">
            ///	带width和height属性的对象[可选]
            /// 若不提供，则获取大小。
            ///</param>
            ///<returns type="object">带width和height属性的对象</returns>
            var ww = 0, wh = 0;
            if (typeof (window.innerWidth) == 'number') {
                //Non-IE
                ww = window.innerWidth;
                wh = window.innerHeight;
            }
            else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
                //IE 6+ in 'standards compliant mode'
                ww = document.documentElement.clientWidth;
                wh = document.documentElement.clientHeight;
            }
            else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
                //IE 4 compatible
                ww = document.body.clientWidth;
                wh = document.body.clientHeight;
            }
            if (!sz) {
                return { width: ww, height: wh };
            }

            if (sz.width !== undefined && sz.height !== undefined) {
                window.resizeTo(sz.width, sz.height);
            }
            else if (sz.width === undefined && sz.height !== undefined) {
                window.resizeTo(ww, sz.height);
            }
            else if (sz.width !== undefined && sz.height === undefined) {
                window.resizeTo(sz.width, wh);
            }
            return this;
        },

        scrollPos: function(pos) {
            var sx = 0, sy = 0;
            if (typeof (window.pageYOffset) == 'number') {
                //Netscape compliant
                sy = window.pageYOffset;
                sx = window.pageXOffset;
            }
            else if (document.body && (document.body.scrollLeft || document.body.scrollTop)) {
                //DOM compliant
                sy = document.body.scrollTop;
                sx = document.body.scrollLeft;
            }
            else if (document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
                //IE6 standards compliant mode
                sy = document.documentElement.scrollTop;
                sx = document.documentElement.scrollLeft;
            }
            if (!pos) {
                return { x: sx, y: sy };
            }
            return this;
        }
    });

    new Window(window);
    $.Window = Window;
})(JUI);