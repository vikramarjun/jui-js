(function($) {
    // add to loaded module-list
    $.register('element', '1.0.0.0');

    // detect features
    var support = {}, cache = {}, collected = {};

    (function() {
        var testee = document.createElement('div'), id = '_jui_' + (new Date()).getTime();
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
            leadingWhitespace: testee.firstChild.nodeType == 3,

            // Make sure that tbody elements aren't automatically inserted
            // IE will insert them into empty tables
            tbody: !!testee.getElementsByTagName("tbody").length,

            // Make sure that link elements get serialized correctly by innerHTML
            // This requires a wrapper element in IE
            htmlSerialize: !!testee.getElementsByTagName("link").length,

            // Verify style float existence
            // (IE uses styleFloat instead of cssFloat)
            cssFloat: !!testee.style.cssFloat,

            // these will be specified later
            cloneEvent: false
        };

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
        if ($.type(selector) !== 'string') {
            return repack(selector);
        }

        var el, els, re = /^#([\w-]+)$/;
        if (re.test(selector) || !$.loaded('selector')) {
            return repack(document.getElementById(selector));
        }
        else {
            els = $.Whizz(selector);
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

    /**
    * Element.Style.js
    *
    * */
    Element.implement({
        setStyle: function(style, value) {
            style = alias[style] || style.replace(/-\D/g, function(match) {
                return match.charAt(1).toUpperCase();
            });
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
        },

        data: function(name, value) {
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
        getElement: function(selector) {
            if ($.loaded('selector')) {
                return new Element($.Whizz(selector, this)[0]);
            }
            else {
                return new Element(this.getElementsByTagName(selector)[0]);
            }
        },

        getElements: function(selector) {
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

        clone: function(content) {
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
            el.insertBefore(this, el.firstChild);
            return this;
        },

        appendTo: function(el) {
            el.appendChild(this);
            return this;
        },

        insertInto: function(el, pos) {
            if (pos == 'top') {
                this.prependTo(el);
            }
            else {
                this.appendTo(el);
            }

            return this;
        },

        //insertBefore: function() {       },

        insertAfter: function(el) {
            var p = el.parentNode;
            if (el.nextSibling) {
                p.insertBefore(this, el.nextSibling);
            }
            else {
                p.appendChild(this);
            }
            return this;
        },

        remove: function(el) {
            this.removeChild(el);
        },

        dispose: function() {
            return (this.parentNode) ? this.parentNode.removeChild(this) : this;
        },

        empty: function() {
            var child, childNodes = this.childNodes, i = 0;
            while (child = childNodes[i++]) {
                child.destroy();
            }
            return this;
        },

        destroy: function() {
            this.empty();
            this.dispose();
            this.removeEvents();
            return null;
        }
    });

    Element.alias(['injectInto', 'injectTo'], 'insertInto');

    /**
    * Element.Event.js
    *
    * */
    Element.implement({
        cloneEvents: function(from, type) {
            // copy events from an element
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

        addEvent: function(type, fn, same) {
            var events = this.data('events') || this.data('events', {});

            events[type] = events[type] || [];
            if (!same && events[type].indexOf(fn) > -1) {
                return this;
            }

            if (type == 'unload') {
                var old = fn, self = this;
                fn = function() {
                    self.removeListener('unload', fn);
                    old();
                };
            }
            //else {
            //    collected[this.uid] = this;
            //}

            if (this.addEventListener) {
                this.addEventListener(type, fn, false);
            }
            else {
                this.attachEvent('on' + type, fn);
            }

            events[type].push(fn);
            return this;
        },

        removeEvent: function(type, fn) {
            var events = this.data('events');
            if (!events || !events[type]) {
                return this;
            }

            if (!fn) {
                // remove all events of this type
                var i = 0, fns = events[type];
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

            var pos = events[type].indexOf(fn);
            if (pos == -1) {
                return this;
            }

            events[type].splice(pos, 1)[0];
            if (this.removeEventListener) {
                this.removeEventListener(type, fn, false);
            }
            else {
                this.detachEvent('on' + type, fn);
            }

            return this;
        },

        addEvents: function(events) {
            for (var type in events) {
                this.addEvent(type, events[type]);
            }

            return this;
        },

        removeEvents: function(events) {
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
})(JUI);