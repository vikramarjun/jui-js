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
    //$.register('fx.morph', '1.0.0.0');

    ///<class>
    ///    <name>$.Fx.Morph</name>
    ///    <summary>
    ///         动画操作类。
    ///    </summary>
    ///    <include>$,$.Element,$.Fx</include>
    ///</class>

    var Morph = function(dom, options) {
        ///<summary>
        /// 构造函数，创建一个新的$.Fx.Morph对象。
        ///</summary>
        ///<param name="dom" type="Object">要创建的Dom或者选择器</param>
        ///<param name="options" type="Object">
        ///配置[可选]
        /// {
        ///		onStart:		[function,		当动画开始时要调用的方法][可选],
        ///		onComplete:		[function,		当动画完成时要调用的方法][可选],
        ///		onCancel:		[function,		当动画取消时要调用的方法][可选],
        ///		onEnterFrame:	[function,		当动画改变时要调用的方法][可选],
        ///		fps:			[int,			每秒钟填充图像的帧数（帧/秒）][可选(50)],
        ///		duration:		[function,		动画的持续时间][可选(500)],
        ///		unit:			[string,		单位，可以是px，em，%等等][可选，未实现(false)],
        ///		link:			[string,		元素上的链接][可选，未实现(ignore)],
        ///		effect:			[string,		动画效果，例："Quad:in:out"][可选，(false)],
        /// }
        ///</param>
        ///<returns type="$.Morph" />

        var _from = {}, _change = {}, _dom = $(dom);

        // 继承父类的方法
        this.constructor.superclass.constructor.apply(this, [options]);

        this.change = function(pos) {
            ///<summary>
            /// 立即改变样式
            ///</summary>
            ///<param name="pos" type="string">样式的改变量</param>

            ///<returns type="undefined" />
            for (var p in _from) {
                _dom.setStyle(p, Math.round(_from[p] + pos * _change[p]));
            }
        };

        this.start = function(styles, options) {
            ///<summary>
            /// 启动动画
            ///</summary>
            ///<param name="styles" type="object">要改变的样式，例：{ 'width': [200, 800], 'height': [20, 200] }</param>
            ///<param name="options" type="object">
            ///配置[可选]
            /// {
            /// }
            ///</param>
            ///<returns type="undefined" />

            if (!styles) {
                return;
            }

            for (var p in styles) {
                if ($.type(styles[p]) !== 'array' || styles[p].length === 1 || styles[p][0] === undefined) {
                    _from[p] = parseFloat(_dom.getStyle(p));
                    _from[p] = isNaN(_from[p]) ? 0 : _from[p];
                    _change[p] = parseFloat(styles[p][0] === undefined ? styles[p] : styles[p][1]);
                    _change[p] = (isNaN(_change[p]) ? 0 : _change[p]) - _from[p];
                }
                else {
                    _from[p] = parseFloat(styles[p][0]);
                    _from[p] = isNaN(_from[p]) ? 0 : _from[p];
                    _change[p] = parseFloat(styles[p][1]);
                    _change[p] = (isNaN(_change[p]) ? 0 : _change[p]) - _from[p];
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