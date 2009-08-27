(function($) {
    // add to loaded module-list
    $.register('element', '1.0.0.0');

    var Element = function(selector) {
        var el = document.getElementById(selector);
        if (!el.$family && !(/^object|embed$/i).test(el.tagName)) {
            var proto = Element.prototype;
            for (var p in proto) el[p] = proto[p];
        }

        return el;
    };

    $.Native.initialize({
        name: 'Element',
        initialize: Element,
        protect: true
    });

    Element.implement('hide', function() {
        alert(this);
        this.style.display = 'none';
    });

    $.Element = Element;
})(JUI);