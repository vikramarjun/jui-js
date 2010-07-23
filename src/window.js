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
            var ww = document.documentElement.clientWidth || document.body.clientWidth || window.innerWidth,
                wh = document.documentElement.clientHeight || document.body.clientHeight || window.innerHeight;

            if (sz) {
                ww = sz.width === undefined ? ww : sz.width;
                wh = sz.height === undefined ? wh : sz.height;
                window.resizeTo(ww, wh);
                return this;
            }

            return { width: ww, height: wh };

        },

        scrollPos: function(pos) {
            ///<summary>
            /// 设置或者获取窗口滚动条位置
            ///</summary>
            ///<param name="style" type="Object">
            ///	带x和y属性的对象[可选]
            /// 若不提供，则获取大小。
            ///</param>
            ///<returns type="object">带x和y属性的对象</returns>
            if (pos) {
                (pos.x !== undefined) && (window.scrollLeft = pos.x);
                (pos.y !== undefined) && (window.scrollTop = pos.y);
                return this;
            }

            var sx = document.documentElement.scrollLeft || document.body.scrollLeft,
                sy = document.documentElement.scrollTop || document.body.scrollTop;
            return { x: sx, y: sy };
        }
    });

    //new Window(window);
    $.Window = Window;
})(JUI);