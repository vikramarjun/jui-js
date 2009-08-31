JUI.requires('string');

(function($) {
    // add to loaded module-list
    $.register('element', '1.0.0.0');

    // detect features
    var support = {};

    (function() {
        var testee = document.createElement('div'), id = '_jui_' + (new Date()).getTime();
        testee.innerHTML = '<a name="' + id + '" class="€ b">a</a>';
        //support.opacity = (typeof testee.style.opacity) !== 'undefined' ? 1 : ((typeof testee.filters === 'object') || (typeof testee.filter === 'string')) ? 2 : 0;
        // do not support any other old browsers
        support = {
            opacity: (typeof testee.style.opacity) !== 'undefined' ? true : false,
            innerText: (typeof testee.innerText) !== undefined ? true : false,
            cssFloat: (typeof testee.style.cssFloat) !== 'undefined' ? true : false
        }
    })();

    var alias = {
        'class': 'className',
        'for': 'htmlFor',
        'float': support.cssFloat ? 'cssFloat' : 'styleFloat'
    };
    alias.cssFloat = alias.styleFloat = alias['float'];

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

    var Element = function(selector) {
        var el, els, re = /^#([\w-]+)$/;
        if (re.test(selector) || !$.loaded('selector')) {
            return repack(document.getElementById(selector));
        }
        else {
            els = $.Whizz(selector);
            var i = 0, array = [];
            while ((array[i] = repack(els[i++]))) { }
            array.length--;
            return new Elements(array);
        }
    };

    var Elements = function(els) {
        if (els && els.$family !== 'elements') {
            var proto = Elements.prototype;
            for (var p in proto) {
                els[p] = proto[p];
            }
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

    Elements.implement({ 'test': function() { } });

    Element.implement({
        setStyle: function(style, value) {
            style = alias[style] || style.toCamelCase();
            switch (style) {
                case 'opacity':
                    if (support.opacity) {
                        this.style.opacity = value;
                    }
                    else {
                        // Set the alpha filter to set the opacity
                        this.style.filter = (this.style.filter || "").replace(/alpha\([^)]*\)/, "") + (parseInt(value) + '' == "NaN" ? "" : "alpha(opacity=" + value * 100 + ")");
                        // IE has trouble with opacity if it does not have layout
                        // Force it by setting the zoom level
                        this.zoom = 1;
                    }
                    break;
                case 'width':
                case 'height':
                    if (/^\d+$/.test(value)) {
                        this.style[style] = value + 'px';
                    }
                    break;
                default:
                    this.style[style] = value;
                    break;
            }
        },

        getStyle: function(style) {
            style = alias[style] || style.toCamelCase();
            switch (style) {
                case 'opacity':
                    if (support.opacity) {
                        return this.style.opacity;
                    }
                    else {
                        return this.style.filter && this.style.filter.indexOf("opacity=") >= 0 ? (parseFloat(this.style.filter.match(/opacity=([^)]*)/)[1]) / 100) + '' : "";
                    }
                case 'width':
                    return this.offsetWidth;
                case 'height':
                    return this.offsetHeight;
                default:
                    return this.style[style];
            }
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

        txt: function(text) {
            if (text === undefined) {
                return this[support.innerText ? 'innerText' : 'textContent'];
            }
            else {
                this.html(text.escapseHTML());
                return this;
            }
        },

        html: function(html) {
            if (html === undefined) {
                return this.innerHTML;
            }
            else {
                this.innerHTML = html;
                return this;
            }
        },

        size: function(sz) {
            if (sz === undefined) {
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
                    if (($.browser.opera || $.browser.webkit) && this.style.position == 'absolute') {
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
        },

        hide: function() {
            this.style.display = 'none';
        },

        show: function() {
            this.style.display = '';
            this.style.visibility = 'visible';
            if ((window.getComputedStyle ? window.getComputedStyle(this, null).display : this.currentStyle.display) == 'none') {
                this.style.display = 'block';
            }
        }
    });

    $.Element = Element;
})(JUI);