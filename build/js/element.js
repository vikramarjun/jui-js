/*
* Author:
*   xushengs@gmail.com
*   http://fdream.net/
* */
(function($) {
    // add to loaded module-list
    $.register('element', '1.0.1.0');

    // detect features
    var support = {}, cache = {}, collected = {};

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
        /* 原本只是用来封装DOM查询结果的
        * 现在增加创建新元素的方法
        * 查询时：
        *   create为false,
        *   selector为css选择器
        * 创建新元素时：
        *   selector为标签名,
        *   create为元素的属性
        *     样式可以作为style属性写在create中
        * */
        if (prop !== false) {
            var el = repack(document.createElement(tag));
            // 设置样式表
            if (prop && prop.style) {
                el.css(prop.style);
                delete prop.style;
            }
            // 设置元素属性
            el.attr(prop);
            return el;
        }

        if ($.type(tag) !== 'string') {
            return repack(tag);
        }
        var el, els, re = /^#([\w-]+)$/;
        if (re.test(tag) || !$.loaded('selector')) {
            return repack(document.getElementById(tag.replace('#', '')));
        }
        else {
            els = $.Whizz(tag);
            return new Elements(els);
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
                return (elements) ? new Elements(items) : items;
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

    function contains(arr, item) {
        var i = 0, l = arr.length;
        for (var i = 0; i < l; i++) {
            if (arr[i] == item) {
                return true;
            }
        }
        return false;
    }

    /**
    * Element.Style.js
    *
    * */
    Element.implement({
        setStyle: function(style, value) {
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
            var key = alias[attr];
            var value = (key) ? this[key] : this.getAttribute(attr, 2);
            return (bools[attr]) ? !!value : (key) ? value : value || null;
        },

        setProperty: function(attr, value) {
            var key = alias[attr];
            if (key && bools[attr]) value = !!value;
            key ? this[key] = value : this.setAttribute(attr, '' + value);
        },

        attr: function(attr, value) {
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
    * Element.Data.js
    *
    * */
    Element.implement({
        data: function(name, value) {
            ///<summary>
            /// 在该元素上存储或者读取数据
            ///</summary>
            ///<param name="name" type="String">
            ///   要存储的数据的名称
            ///</param>
            ///<param name="value" type="Object">
            ///   [可选]要存储的数据的值，
            ///   若不提供，则读取该元素上已存储的对应的数据。
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
            /// 清除在该元素上存储的数据
            ///</summary>
            ///<param name="name" type="String">
            ///   [可选]要删除的数据的名称，
            ///   若不提供，则删除该节点上存储的所有数据。
            ///</param>
            ///<returns type="$.Element" />

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
            if ($.loaded('selector')) {
                els = $.Whizz(selector, this);
            }
            else {
                els = this.getElementsByTagName(selector);
            }
            return els[0] ? new Element(els[0]) : null;
        },

        getElements: function(selector) {
            ///<summary>
            /// 获取当前元素下符合选择器的所有元素
            ///</summary>
            ///<param name="selector" type="String">
            ///   CSS选择器
            ///</param>
            ///<returns type="$.Elements" />

            if ($.loaded('selector')) {
                return new Elements($.Whizz(selector, this));
            }
            else {
                return new Elements(this.getElementsByTagName(selector));
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

                return new Element(clean(html.replace(new RegExp($.expando + '="(?:\d+|null)"', 'g'), "").replace(/^\s*/, "")));
            }
            else {
                return new Element(this.cloneNode(content));
            }
        },

        prependTo: function(el) {
            ///<summary>
            /// 把当前元素插入到指定元素内头部
            ///</summary>
            ///<param name="el" type="$.Element">
            ///   要插入的目标容器
            ///</param>
            ///<returns type="$.Element" />

            el.insertBefore(this, el.firstChild);
            return this;
        },

        appendTo: function(el) {
            ///<summary>
            /// 把当前元素插入到指定元素内尾部
            ///</summary>
            ///<param name="el" type="$.Element">
            ///   要插入的目标容器
            ///</param>
            ///<returns type="$.Element" />

            el.appendChild(this);
            return this;
        },

        inject: function(el, pos) {
            ///<summary>
            /// 把当前元素插入到指定元素内头部或者尾部
            ///</summary>
            ///<param name="el" type="$.Element">
            ///   要插入的目标容器
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
            /// 把当前元素插入到指定元素前面
            ///</summary>
            ///<param name="el" type="$.Element">
            ///   要插入位置的参考元素
            ///</param>
            ///<returns type="$.Element" />

            el.parentNode.insertBefore(this, el);
            return this;
        },

        after: function(el) {
            ///<summary>
            /// 把当前元素插入到指定元素后面
            ///</summary>
            ///<param name="el" type="$.Element">
            ///   要插入位置的参考元素
            ///</param>
            ///<returns type="$.Element" />

            var p = el.parentNode;
            if (el.nextSibling) {
                p.insertBefore(this, el.nextSibling);
            }
            else {
                p.appendChild(this);
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

            var child, childNodes = this.childNodes, i = 0;
            while (child = childNodes[i++]) {
                child.destroy();
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

    /**
    * Element.Event.js
    *
    * */
    Element.implement({
        cloneEvents: function(from, type) {
            ///<summary>
            /// 从目标元素复制事件
            ///</summary>
            ///<param name="from" type="$.Element">要复制事件的目标元素</param>
            ///<param name="type" type="String">要复制的事件类型</param>
            ///<returns type="$.Element" />

            from = new Element(from);
            var fevents = this.data('events');
            if (!fevents) {
                return;
            }

            if (!type) {
                for (var evType in fevents) this.cloneEvents(from, evType);
            }
            else if (fevents[type]) {
                var i = 0, fn, fns = fevents[type].keys;
                while (fn = fns[i++]) {
                    this.addEvent(type, fn);
                }
            }
            return this;
        },

        addEvent: function(type, fn, bind, same) {
            ///<summary>
            /// 给元素添加事件
            ///</summary>
            ///<param name="type" type="String">事件类型，不带前面的on</param>
            ///<param name="fn" type="Fucntion">事件处理函数</param>
            ///<param name="bind" type="Object">事件处理函数中this指向的对象</param>
            ///<param name="same" type="Boolean">是否允许重复添加完全相同的事件</param>
            ///<returns type="$.Element" />

            var events = this.data('events') || this.data('events', {});
            bind = bind ? bind : this;

            events[type] = events[type] || { keys: [], values: [] };
            if (!same && contains(events[type].keys, fn)) {
                return this;
            }

            var defn = function(e) {
                if ($.loaded('event')) {
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
            //else {
            //    collected[this.uid] = this;
            //}

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
            /// 给元素添加事件
            ///</summary>
            ///<param name="type" type="String">事件类型，不带前面的on</param>
            ///<param name="fn" type="Fucntion">
            ///   [可选]事件处理函数，如果不提供则删除所有该类型的事件
            ///</param>
            ///<returns type="$.Element" />

            var events = this.data('events');
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
                    this.data('events', events);
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
            /// 一次性给元素添加多个事件
            ///</summary>
            ///<param name="events" type="Object">
            ///   一个以事件类型为键（key），以事件处理函数为值（value）的hash对象
            ///</param>
            ///<returns type="$.Element" />

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
            ///<returns type="$.Element" />

            if ($.type(events) == 'object') {
                for (var type in events) {
                    this.removeEvent(type, events[type]);
                }
                return this;
            }

            var attached = this.data('events');
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
            /// 给元素添加事件
            ///</summary>
            ///<param name="type" type="String">事件类型，不带前面的on</param>
            ///<param name="args" type="Array">要传递给事件处理函数的参数</param>
            ///<param name="delay" type="Number">延迟触发事件的时间</param>
            ///<returns type="$.Element" />

            var events = this.data('events');
            if (!events || !events[type]) {
                return this;
            }

            var i = 0, fns = events[type], fn, ret, self = this;
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

    $.Element = Element;
    $.Elements = Elements;
})(JUI);