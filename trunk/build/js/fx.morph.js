/*
* Author:
*   xushengs@gmail.com
*   http://fdream.net/
* */
/*
* requires:
*   element.js
*   fx.js
*
* */
(function($) {
    // add to loaded module-list
    $.register('fx.morph', '1.0.0.0');

    var Morph = function(dom, options) {
        var _from = {}, _change = {}, _dom = $(dom);

        // 继承父类的方法
        this.constructor.superclass.constructor.apply(this, [options]);

        this.change = function(pos) {
            for (var p in _from) {
                _dom.setStyle(p, Math.round(_from[p] + pos * _change[p]));
            }
        };

        this.start = function(styles, options) {
            if (!styles) {
                return;
            }

            for (var p in styles) {
                if ($.type(styles[p]) !== 'array' || styles[p].length === 1 || styles[p][0] === undefined) {
                    _from[p] = _dom.getStyle(p);
                    _change[p] = (styles[p][0] === undefined ? styles[p] : styles[p][1]) - _from[p];
                }
                else {
                    _from[p] = styles[p][0];
                    _change[p] = styles[p][1] - _from[p];
                }
            }
            this.startTimer();
        };
    };

    Morph = $.extend(Morph, $.Fx);


    $.Native.initialize({
        name: 'Fx.Morph',
        initialize: Morph,
        protect: false
    });

    $.Fx.Morph = Morph;
})(JUI);