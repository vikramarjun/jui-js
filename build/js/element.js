/*
* Author:
*   xushengs@gmail.com
*   http://fdream.net/
* */
(function($) {
    // add to loaded module-list
    //$.register('element', '1.0.1.0');

    ///<class>
    ///    <name>$.Element</name>
    ///    <summary>
    ///         提供封装好Element元素，并提供常用的DOM操作方法。
    ///    </summary>
    ///    <include>$</include>
    ///</class>

    // detect features
    var support = {}; //, cache = {}; //, collected = {};

    (function() {
        var /*de = document.documentElement,*/testee = document.createElement('div'), id = '_jui_' + (new Date()).getTime(), testee_a;
        testee.innerHTML = '   <link/><table></table><a name="' + id + '" class="€ b" href="/a" style="color:red;float:left;opacity:.5;">a</a><select><option>text</option></select>';
        //support.opacity = (typeof testee.style.opacity) !== 'undefined' ? 1 : ((typeof testee.filters === 'object') || (typeof testee.filter === 'string')) ? 2 : 0;
        // do not support any other old browsers
        support = {
            // IE don't support opacity
            // but use filter instead
            opacity: (typeof testee.style.opacity) !== 'undefined' ? true : false,

            // FF use textContent instead of innerText
            innerText: (typeof testee.innerText) !== undefined ? true : false,

            // IE strips leading whitespace when .innerHTML is used
            leadingWhitespace: testee.firstChild && testee.firstChild.nodeType == 3,

            // Verify style float existence
            // (IE uses styleFloat instead of cssFloat)
            cssFloat: !(testee.style.cssFloat === undefined),

            // these will be specified later
            cloneEvent: false,

            // Make sure that tbody elements aren't automatically inserted
            // IE will insert them into empty tables
            tbody: false,

            // Make sure that link elements get serialized correctly by innerHTML
            // This requires a wrapper element in IE
            htmlSerialize: false
        };

        if (testee.getElementsByTagName) {
            support.tbody = !!testee.getElementsByTagName("tbody").length;
            support.htmlSerialize = !!testee.getElementsByTagName("link").length;
        }

        // clone event test
        if (testee.attachEvent && testee.fireEvent) {
            testee.attachEvent("onclick", function click() {
                // Cloning a node shouldn't copy over any
                // bound event handlers (IE does this)
                support.cloneEvent = true;
                testee.detachEvent("onclick", click);
            });
            testee.cloneNode(true).fireEvent("onclick");
        }
    })();


    function toCamelCase(str) {
        return str.replace(/-\D/g, function(match) {
            return match.charAt(1).toUpperCase();
        });
    }

    function toHyphenCase(str) {
        return str.replace(/[A-Z]/g, function(match) {
            return ('-' + match.charAt(0).toLowerCase());
        });
    }

    var alias = {
        'class': 'className',
        'for': 'htmlFor',
        'float': support.cssFloat ? 'cssFloat' : 'styleFloat'
    },
        unit = {
            left: '@px', top: '@px', bottom: '@px', right: '@px',
            width: '@px', height: '@px', maxWidth: '@px', maxHeight: '@px', minWidth: '@px', minHeight: '@px',
            backgroundColor: 'rgb(@, @, @)', backgroundPosition: '@px @px', color: 'rgb(@, @, @)',
            fontSize: '@px', letterSpacing: '@px', lineHeight: '@px', clip: 'rect(@px @px @px @px)',
            margin: '@px @px @px @px', padding: '@px @px @px @px', border: '@px @ rgb(@, @, @) @px @ rgb(@, @, @) @px @ rgb(@, @, @)',
            borderWidth: '@px @px @px @px', borderStyle: '@ @ @ @', borderColor: 'rgb(@, @, @) rgb(@, @, @) rgb(@, @, @) rgb(@, @, @)',
            zIndex: '@', 'zoom': '@', fontWeight: '@', textIndent: '@px', opacity: '@'
        },
        shorts = { margin: {}, padding: {}, border: {}, borderWidth: {}, borderStyle: {}, borderColor: {} };

    (function() {
        var direction = ['Top', 'Right', 'Bottom', 'Left'],
            m = 'margin', p = 'padding', b = 'border',
            i = direction.length, d;
        while (d = direction[--i]) {
            var md = m + d, pd = p + d, bd = b + d;
            shorts[m][md] = unit[md] = '@px';
            shorts[p][pd] = unit[pd] = '@px';
            shorts[b][bd] = unit[bd] = '@px @ rgb(@, @, @)';
            var bdw = bd + 'Width', bds = bd + 'Style', bdc = bd + 'Color';
            shorts[bd] = {};
            shorts.borderWidth[bdw] = shorts[bd][bdw] = unit[bdw] = '@px';
            shorts.borderStyle[bds] = shorts[bd][bds] = unit[bds] = '@';
            shorts.borderColor[bdc] = shorts[bd][bdc] = unit[bdc] = 'rgb(@, @, @)';
        }
    })();

    var bools = {
        'compact': true,
        'nowrap': true,
        'ismap': true,
        'declare': true,
        'noshade': true,
        'checked': true,
        'disabled': true,
        'readonly': true,
        'multiple': true,
        'selected': true,
        'noresize': true,
        'defer': true
    };

    var Element = function(tag, prop) {
        ///<summary>
        /// 构造函数，创建一个新的$.Element对象。
        ///</summary>
        ///<param name="tag" type="String">要创建的元素的标签名，如div，p等等。</param>
        ///<param name="prop" type="Object">
        ///     元素的style属性，以key/value方式组成一个Object。
        ///</param>
        ///<returns type="$.Element" />

        /* 原本只是用来封装DOM查询结果的
        * 现在增加创建新元素的方法
        * 查询时：
        *   prop为false,
        *   tag为css选择器
        * 创建新元素时：
        *   tag为标签名,
        *   prop为元素的属性
        *     样式可以作为style属性写在create中
        * */
        if (prop !== false) {
            if ($.type(tag) !== 'string') {
                var rt = [];
                for (var p in tag) {
                    rt.push(new Element(p, tag[p]));
                }
                return new Elements(rt);
            }

            var el = repack(document.createElement(tag));
            // 设置样式表
            if (prop) {
                if (prop.style) {
                    el.css(prop.style);
                    delete prop.style;
                }

                if (prop.html) {
                    el.html(prop.html);
                }
            }
            // 设置元素属性
            el.attr(prop);
            return el;
        }

        if ($.type(tag) !== 'string') {
            return repack(tag);
        }
        var el, els, re = /^#([\w-]+)$/;
        if (re.test(tag) || !$.Selector) {
            return repack(document.getElementById(tag.replace('#', '')));
        }
        else {
            els = $.Selector(tag);
            return new Elements(els, false);
        }
    };

    var Elements = function(els) {
        if (els && els.$family !== 'elements') {
            var i = 0, array = [];
            while ((array[i] = repack(els[i++]))) { }
            array.length--;
            var proto = Elements.prototype;
            for (var p in proto) {
                array[p] = proto[p];
            }
            els = array;
        }
        return els;
    };

    function repack(el) {
        if (el && !el.$family && !(/^object|embed$/i).test(el.tagName)) {
            var proto = Element.prototype;
            for (var p in proto) {
                el[p] = proto[p];
            }
        }
        return el;
    }

    $.Native.initialize({
        name: 'Element',
        initialize: Element,
        protect: true,
        afterImplement: function(key, value) {
            if (Array[key]) return;
            Elements.implement(key, function() {
                var items = [], elements = true;
                for (var i = 0, j = this.length; i < j; i++) {
                    var returns = this[i][key].apply(this[i], arguments);
                    items.push(returns);
                    if (elements) elements = ($.type(returns) == 'element');
                }
                return (elements) ? new Elements(items, false) : items;
            });
        }
    });

    $.Native.initialize({
        name: 'Elements',
        initialize: Elements,
        protect: true
    });

    function clean(html) {
        // If a single string is passed in and it's a single tag
        // just do a createElement and skip the rest
        var match = /^<(\w+)\s*\/?>$/.exec(html);
        if (match) {
            return document.createElement(match[1]);
        }

        var ret = [], scripts = [], div = document.createElement("div");

        // Fix "XHTML"-style tags in all browsers
        html = html.replace(/(<(\w+)[^>]*?)\/>/g, function(all, front, tag) {
            return tag.match(/^(abbr|br|col|img|input|link|meta|param|hr|area|embed)$/i) ?
						all :
						front + "></" + tag + ">";
        });

        // Trim whitespace, otherwise indexOf won't work as expected
        var tags = html.replace(/^\s+/, "").substring(0, 10).toLowerCase();

        var wrap =
        // option or optgroup
					!tags.indexOf("<opt") &&
					[1, "<select multiple='multiple'>", "</select>"] ||

					!tags.indexOf("<leg") &&
					[1, "<fieldset>", "</fieldset>"] ||

					tags.match(/^<(thead|tbody|tfoot|colg|cap)/) &&
					[1, "<table>", "</table>"] ||

					!tags.indexOf("<tr") &&
					[2, "<table><tbody>", "</tbody></table>"] ||

        // <thead> matched above
					(!tags.indexOf("<td") || !tags.indexOf("<th")) &&
					[3, "<table><tbody><tr>", "</tr></tbody></table>"] ||

					!tags.indexOf("<col") &&
					[2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"] ||

        // IE can't serialize <link> and <script> tags normally
					!support.htmlSerialize &&
					[1, "div<div>", "</div>"] ||

					[0, "", ""];

        // Go to html and back, then peel off extra wrappers
        div.innerHTML = wrap[1] + html + wrap[2];

        // Move to the right depth
        while (wrap[0]--) {
            div = div.lastChild;
        }

        // Remove IE's autoinserted <tbody> from table fragments
        if (support.tbody) {
            // String was a <table>, *may* have spurious <tbody>
            var hasBody = /<tbody/i.test(html),
						tbody = !tags.indexOf("<table") && !hasBody ?
							div.firstChild && div.firstChild.childNodes :
            // String was a bare <thead> or <tfoot>
						    wrap[1] == "<table>" && !hasBody ?
							div.childNodes :
							[];

            for (var j = tbody.length - 1; j >= 0; --j) {
                if ((tbody[j].tagName == "TBODY") && !tbody[j].childNodes.length) {
                    tbody[j].parentNode.removeChild(tbody[j]);
                }
            }
        }

        // IE completely kills leading whitespace when innerHTML is used
        if (!support.leadingWhitespace && /^\s/.test(html)) {
            div.insertBefore(document.createTextNode(html.match(/^\s*/)[0]), div.firstChild);
        }

        return div.firstChild;
    }

    /**
    * Element.Style.js
    *
    * */
    Element.implement({
        hasClass: function(cls) {
            ///<summary>
            /// 是否有指定的CSS类名
            ///</summary>
            ///<param name="cls" type="string">CSS类名</param>
            ///<returns type="Boolean" />

            return (' ' + this.className + ' ').indexOf(' ' + cls + ' ') > -1;
        },

        addClass: function(cls) {
            ///<summary>
            /// 添加CSS类
            ///</summary>
            ///<param name="cls" type="string">CSS类名</param>
            ///<returns type="$.Element" />

            if (!this.hasClass(cls)) {
                this.className = this.className === '' ? cls : (this.className + ' ' + cls);
            }

            return this;
        },

        removeClass: function(cls) {
            ///<summary>
            /// 删除CSS类
            ///</summary>
            ///<param name="cls" type="string">CSS类名</param>
            ///<returns type="$.Element" />

            this.className = this.className.replace(new RegExp('(^|\\s)' + cls + '(?:\\s|$)', 'g'), '$1');
            return this;
        },

        setStyle: function(style, value) {
            ///<summary>
            /// 设置样式
            ///</summary>
            ///<param name="style" type="string">样式名</param>
            ///<param name="value" type="string">样式值</param>
            ///<returns type="$.Element" />

            if (style == 'opacity') {
                value = parseFloat(value);
                if (support.opacity) {
                    this.style.opacity = value;
                }
                else {
                    // Set the alpha filter to set the opacity
                    this.style.filter = (this.style.filter || '').replace(/alpha\([^)]*\)/, '') + (value + '' == 'NaN' ? '' : 'alpha(opacity=' + value * 100 + ')');
                    // IE has trouble with opacity if it does not have layout
                    // Force it by setting the zoom level
                    this.zoom = 1;
                }
                if (opacity == 0) {
                    if (this.style.visibility != 'hidden') {
                        this.style.visibility = 'hidden';
                    }
                }
                else {
                    if (this.style.visibility != 'visible') {
                        this.style.visibility = 'visible';
                    }
                }
                return;
            }

            style = alias[style] || toCamelCase(style);
            var type = $.type(value);
            if (type != 'string') {
                value = (type != 'array' && type != 'arguments') ? [value] : value;
                var fmt = (unit[style] || '@').split(' '), i = fmt.length, v;
                while (i--) {
                    v = value[i];
                    if (!(v === 0 || v)) {
                        fmt[i] = '';
                    }
                    else {
                        fmt[i] = $.type(v) == 'number' ? fmt[i].replace('@', Math.round(v)) : v;
                    }
                }
                value = fmt.join(' ');
            }
            else if (value == '' + Number(value)) {
                value = Math.round(value);
            }
            try {
                this.style[style] = value;
            }
            catch (e) { }
            return this;
        },

        getStyle: function(style) {
            ///<summary>
            /// 获取样式
            ///</summary>
            ///<param name="style" type="string">样式名</param>
            ///<returns type="string" />
            if (style == 'opacity') {
                if (support.opacity) {
                    return this.style.opacity;
                }
                else {
                    return this.style.filter && this.style.filter.indexOf('opacity=') >= 0 ? (parseFloat(this.style.filter.match(/opacity=([^)]*)/)[1]) / 100) + '' : '';
                }
            }

            style = alias[style] || toCamelCase(style);
            var result = this.style[style];
            if (!(result === 0 || result)) {
                result = [];
                // if is a short, return joined value
                for (var ss in shorts) {

                    if (style != ss) {
                        continue;
                    }
                    for (var s in shorts[ss]) {
                        result.push(this.getStyle(s));
                    }
                    return result.join(' ');
                }
                // or get computed style
                if (this.currentStyle) {
                    return this.currentStyle[style];
                }
                var computed = this.getDocument().defaultView.getComputedStyle(this, null);
                return (computed) ? computed.getPropertyValue([toHyphenCase(style)]) : null;
            }
            /*
            * convert to hex
            *
            if (result) {
            result = ''+ result;
            var color = result.match(/rgba?\([\d\s,]+\)/);
            if (color) result = result.replace(color[0], color[0].rgbToHex());
            }
            //*/
            /*
            * minus border and padding in IE & Opera
            *
            if (Browser.Engine.presto || (Browser.Engine.trident && !$chk(parseInt(result, 10)))) {
            if (style.test(/^(height|width)$/)) {
            var values = (style == 'width') ? ['left', 'right'] : ['top', 'bottom'], size = 0;
            values.each(function(value) {
            size += this.getStyle('border-' + value + '-width').toInt() + this.getStyle('padding-' + value).toInt();
            }, this);
            return this['offset' + property.capitalize()] - size + 'px';
            }
            if ((Browser.Engine.presto) && String(result).test('px')) return result;
            if (property.test(/(border(.+)Width|margin|padding)/)) return '0px';
            }
            //*/
            return result;
        },

        css: function(style, value) {
            ///<summary>
            /// 设置和获取样式
            ///</summary>
            ///<param name="style" type="Object">
            ///	1. (string) 样式名
            /// 2. (object) 样式组			
            ///</param>
            ///<param name="style" type="Object">
            ///	(string) 样式值 [可选]
            /// 若不提供，则获取样式
            ///</param>
            ///<returns type="$.Element" />
            ///<returns type="string" />
            if ($.type(style) == 'object') {
                for (var p in style) {
                    this.setStyle(p, style[p]);
                }
                return this;
            }

            if (value === undefined) {
                return this.getStyle(style);
            }
            else {
                this.setStyle(style, value);
                return this;
            }
        },

        getProperty: function(attr) {
            ///<summary>
            /// 获取属性
            ///</summary>
            ///<param name="style" type="string">属性名</param>
            ///<returns type="string" />
            var key = alias[attr];
            var value = (key) ? this[key] : this.getAttribute(attr, 2);
            return (bools[attr]) ? !!value : (key) ? value : value || null;
        },

        setProperty: function(attr, value) {
            ///<summary>
            /// 设置属性
            ///</summary>
            ///<param name="style" type="string">属性名</param>
            ///<param name="value" type="string">属性值</param>
            ///<returns type="$.Element" />
            var key = alias[attr];
            if (key && bools[attr]) value = !!value;
            key ? this[key] = value : this.setAttribute(attr, '' + value);
            return this;
        },

        attr: function(attr, value) {
            ///<summary>
            /// 设置和获取属性
            ///</summary>
            ///<param name="style" type="Object">
            ///	1. (string) 属性名
            /// 2. (object) 属性组			
            ///</param>
            ///<param name="style" type="Object">
            ///	(string) 属性值 [可选]
            /// 若不提供，则获取属性。
            ///</param>
            ///<returns type="$.Element" />
            ///<returns type="string" />
            if ($.type(attr) == 'object') {
                for (var a in attr) {
                    this.setProperty(a, attr[a]);
                }
                return this;
            }

            if (value === undefined) {
                return this.getProperty(attr);
            }
            else {
                this.setProperty(attr, value);
                return this;
            }
        },

        dimension: function(sz) {
            ///<summary>
            /// 设置和获取大小
            ///</summary>
            ///<param name="style" type="Object">
            ///	带width和height属性的对象[可选]
            /// 若不提供，则获取大小。
            ///</param>
            ///<returns type="$.Element" />
            ///<returns type="object">带width和height属性的对象</returns>
            if (!(sz === 0 || sz)) {
                return { width: this.offsetWidth, height: this.offsetHeight };
            }

            if (sz.width !== undefined) {
                this.css('width', sz.width);
            }
            if (sz.height !== undefined) {
                this.css('height', sz.height);
            }
            return this;
        },

        position: function(pos) {
            ///<summary>
            /// 设置和获取位置
            ///</summary>
            ///<param name="style" type="Object">
            ///	带left和top属性的对象[可选]
            /// 若不提供，则获取位置。
            ///</param>
            ///<returns type="$.Element" />
            ///<returns type="object">带left和top属性的对象</returns>
            if (pos === undefined) {
                if (this.parentNode === null || this.style.display == 'none') {
                    return false;
                }
                if (this.getBoundingClientRect)	// IE
                {
                    box = this.getBoundingClientRect();
                    var scrollTop = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
                    var scrollLeft = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);

                    return { x: box.left + scrollLeft, y: box.top + scrollTop };
                }
                else if (document.getBoxObjectFor)	// gecko
                {
                    box = document.getBoxObjectFor(this);

                    var borderLeft = (this.style.borderLeftWidth) ? parseInt(this.style.borderLeftWidth) : 0;
                    var borderTop = (this.style.borderTopWidth) ? parseInt(this.style.borderTopWidth) : 0;

                    pos = [box.x - borderLeft, box.y - borderTop];
                }
                else	// safari & opera
                {
                    pos = [this.offsetLeft, this.offsetTop];
                    parent = this.offsetParent;
                    if (parent != this) {
                        while (parent) {
                            pos[0] += parent.offsetLeft;
                            pos[1] += parent.offsetTop;
                            parent = parent.offsetParent;
                        }
                    }
                    if (this.style.position == 'absolute') {
                        pos[0] -= document.body.offsetLeft;
                        pos[1] -= document.body.offsetTop;
                    }
                }

                if (this.parentNode) { parent = this.parentNode; }
                else { parent = null; }

                while (parent && parent.tagName != 'BODY' && parent.tagName != 'HTML') {
                    // account for any scrolled ancestors
                    pos[0] -= parent.scrollLeft;
                    pos[1] -= parent.scrollTop;

                    if (parent.parentNode) { parent = parent.parentNode; }
                    else { parent = null; }
                }

                return { x: pos[0], y: pos[1] };
            }

            if (pos.x !== undefined) {
                this.css('left', pos.x);
            }
            if (pos.y !== undefined) {
                this.css('top', pos.y);
            }

            return this;
        }
    });

    /**
    * Element.Dom.js
    *
    * */
    Element.implement({
        getDocument: function() {
            return this.ownerDocument;
        },
        getElement: function(selector) {
            ///<summary>
            /// 获取当前元素下符合选择器的第一个元素
            ///</summary>
            ///<param name="selector" type="String">
            ///   CSS选择器
            ///</param>
            ///<returns type="$.Element" />

            var els = [];
            if ($.Selector) {
                els = $.Selector(selector, this);
            }
            else {
                els = this.getElementsByTagName(selector);
            }
            return els[0] ? new Element(els[0], false) : null;
        },

        getElements: function(selector) {
            ///<summary>
            /// 获取当前元素下符合选择器的所有元素
            ///</summary>
            ///<param name="selector" type="String">
            ///   CSS选择器
            ///</param>
            ///<returns type="$.Elements" />

            if ($.Selector) {
                return new Elements($.Selector(selector, this), false);
            }
            else {
                return new Elements(this.getElementsByTagName(selector), false);
            }
        }
    });

    /**
    * Element.Move.js
    *
    * */
    Element.implement({
        txt: function(text) {
            ///<summary>
            /// 读取或者设置元素内的文本内容
            ///</summary>
            ///<param name="text" type="String">
            ///   [可选]要设置的文本值，如不提供此参数，则读取该元素的文本内容
            ///</param>
            ///<returns type="STRING" />

            if (text === undefined) {
                return this[support.innerText ? 'innerText' : 'textContent'];
            }
            else {
                this.html(text.escapeHTML());
                return text;
            }
        },

        html: function(html) {
            ///<summary>
            /// 读取或者设置元素内的HTML文本
            ///</summary>
            ///<param name="text" type="String">
            ///   [可选]要设置的HTML文本，如不提供此参数，则读取该元素的HTML文本
            ///</param>
            ///<returns type="STRING" />

            if (html !== undefined) {
                this.innerHTML = html;
            }
            return this.innerHTML;
        },

        clone: function(content) {
            ///<summary>
            /// 复制当前元素，返回复制后的元素
            ///</summary>
            ///<param name="content" type="Boolean">
            ///   [可选]是否复制元素的子元素，默认为true
            ///</param>
            ///<returns type="$.Element" />

            // default is clone context of the element
            content = content !== false;
            // Do the clone
            if (support.cloneEvent) {
                // IE copies events bound via attachEvent when
                // using cloneNode. Calling detachEvent on the
                // clone will also remove the events from the orignal
                // In order to get around this, we use innerHTML.
                // Unfortunately, this means some modifications to
                // attributes in IE that are actually only stored
                // as properties will not be copied (such as the
                // the name attribute on an input).
                var html = this.outerHTML;
                if (!html) {
                    var div = this.ownerDocument.createElement("div");
                    div.appendChild(this.cloneNode(content));
                    html = div.innerHTML;
                }

                return new Element(clean(html.replace(new RegExp($.expando + '="(?:\d+|null)"', 'g'), "").replace(/^\s*/, "")), false);
            }
            else {
                return new Element(this.cloneNode(content), false);
            }
        },

        prepend: function(el) {
            ///<summary>
            /// 在当前元素头部插入指定元素
            ///</summary>
            ///<param name="el" type="$.Element">
            ///   要插入的元素
            ///</param>
            ///<returns type="$.Element" />

            el = el.clone();
            if (this.firstChild) {
                this.insertBefore(el, this.firstChild);
            }
            else {
                this.appendChild(el);
            }
            return this;
        },

        append: function(el) {
            ///<summary>
            /// 在当前元素尾部插入指定元素
            ///</summary>
            ///<param name="el" type="$.Element">
            ///   要插入的元素
            ///</param>
            ///<returns type="$.Element" />

            this.appendChild(el.clone());
            return this;
        },

        inject: function(el, pos) {
            ///<summary>
            /// 在当前元素内部插入指定元素
            ///</summary>
            ///<param name="el" type="$.Element">
            ///   要插入的元素
            ///</param>
            ///<param name="pos" type="String">
            ///   [可选]要插入的位置，可为top或者bottom，默认为bottom
            ///</param>
            ///<returns type="$.Element" />

            if (pos == 'top') {
                this.prependTo(el);
            }
            else {
                this.appendTo(el);
            }

            return this;
        },

        insert: function(el, pos) {
            ///<summary>
            /// 把当前元素插入到指定元素的前面或者后面
            ///</summary>
            ///<param name="el" type="$.Element">
            ///   要插入位置的参考元素
            ///</param>
            ///<param name="pos" type="String">
            ///   [可选]要插入的位置，可为before或者after，默认为before
            ///</param>
            ///<returns type="$.Element" />

            if (pos == 'after') {
                this.after(el);
            }
            else {
                this.before(el);
            }

            return this;
        },

        before: function(el) {
            ///<summary>
            /// 在当前元素前面插入指定元素
            ///</summary>
            ///<param name="el" type="$.Element">
            ///   要插入的元素
            ///</param>
            ///<returns type="$.Element" />

            this.parentNode.insertBefore(el.clone(), this);
            return this;
        },

        after: function(el) {
            ///<summary>
            /// 在当前元素后面插入指定元素
            ///</summary>
            ///<param name="el" type="$.Element">
            ///   要插入的元素
            ///</param>
            ///<returns type="$.Element" />

            el = el.clone();
            var p = this.parentNode;
            if (this.nextSibling) {
                p.insertBefore(el, this.nextSibling);
            }
            else {
                p.appendChild(el);
            }
            return this;
        },

        dispose: function() {
            ///<summary>
            /// 把当前元素从父元素中移除
            ///</summary>
            ///<returns type="$.Element" />

            return (this.parentNode) ? this.parentNode.removeChild(this) : this;
        },

        empty: function() {
            ///<summary>
            /// 清除当前元素中的所有内容
            ///</summary>
            ///<returns type="$.Element" />

            var childNodes = this.childNodes, i;
            for (var i = childNodes.length; i > 0; i--) {
                childNodes[i] && $(childNodes[i]).destroy();
            }

            return this;
        },

        destroy: function() {
            ///<summary>
            /// 销毁当前元素并释放内存
            ///</summary>
            ///<returns type="null" />

            this.empty();
            this.dispose();
            this.removeEvents();
            return null;
        }
    });
    Element.alias({ dispose: 'remove' });

    $.Element = Element;
    $.Elements = Elements;
})(JUI);