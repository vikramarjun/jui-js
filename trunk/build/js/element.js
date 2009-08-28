(function($) {
    // add to loaded module-list
    $.register('element', '1.0.0.0');

    var Element = function(selector) {
        var el, els, re = /^#([\w-]+)$/;
        if (re.test(selector) || $.loaded('selector')) {
            return repack(document.getElementById(selector));
        }
        else {
            els = $.Whizz(selector);
            var i = 0, array = [];
            while ((array[i] = repack(els[i++]))) { }
            array.length--;
            return array;
        }
    };

    function repack(el) {
        if (el && !el.$family && !(/^object|embed$/i).test(el.tagName)) {
            var proto = Element.prototype;
            for (var p in proto) el[p] = proto[p];
        }
        return el;
    }

    $.Native.initialize({
        name: 'Element',
        initialize: Element,
        protect: true
    });

    Element.implement({
        'css': function(prop, value) {
            if (value === null) {
                return window.getComputedStyle ? window.getComputedStyle(this, null)[prop] : this.currentStyle[prop];
            }
            else {
                this.style[prop] = value;
            }
        },

        'hide': function() {
            this.style.display = 'none';
        },

        'show': function() {
            this.style.display = '';
            this.style.visibility = 'visible';
            if ((window.getComputedStyle ? window.getComputedStyle(this, null).display : this.currentStyle.display) == 'none') {
                this.style.display = 'block';
            }
        }
    });

    $.Element = Element;
})(JUI);