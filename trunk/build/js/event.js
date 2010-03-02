/*
* Author:
*   xushengs@gmail.com
*   http://fdream.net/
* */
(function($) {
    // add to loaded module-list
    $.register('event', '1.0.0.0');

    var keys = {
        '8': 'backspace',
        '9': 'tab',
        '13': 'enter',
        '27': 'esc',
        '32': 'space',
        '38': 'up',
        '40': 'down',
        '37': 'left',
        '39': 'right',
        '46': 'delete'
    };

    var Event = function(event) {
        if (event.$family === 'event') {
            return event;
        }

        var doc = document, win = window, type = event.type;
        var target = event.target || event.srcElement;
        while (target && target.nodeType == 3) {
            target = target.parentNode;
        }

        if (/key/.test(type)) {
            var code = event.which || event.keyCode;
            var key = keys[code];
            if (type == 'keydown') {
                var fKey = code - 111;
                if (fKey > 0 && fKey < 13) key = 'f' + fKey;
            }
            key = key || String.fromCharCode(code).toLowerCase();
        }
        else if (type.match(/(click|mouse|menu)/i)) {
            doc = (!doc.compatMode || doc.compatMode == 'CSS1Compat') ? doc.documentElement : doc.body;
            var page = {
                x: event.pageX || event.clientX + doc.scrollLeft,
                y: event.pageY || event.clientY + doc.scrollTop
            };
            var client = {
                x: (event.pageX) ? event.pageX - win.pageXOffset : event.clientX,
                y: (event.pageY) ? event.pageY - win.pageYOffset : event.clientY
            };
            if (type.match(/DOMMouseScroll|mousewheel/)) {
                var wheel = (event.wheelDelta) ? event.wheelDelta / 120 : -(event.detail || 0) / 3;
            }
            var rightClick = (event.which == 3) || (event.button == 2);
        }

        return (function(a, b) {
            for (var p in b) {
                a[p] = b[p];
            }
            return a;
        })(this, {
            event: event,
            type: type,

            page: page,
            client: client,
            rightClick: rightClick,

            wheel: wheel,

            target: target,

            code: code,
            key: key,

            shift: event.shiftKey,
            control: event.ctrlKey,
            alt: event.altKey,
            meta: event.metaKey
        });
    };

    $.Native.initialize({
        name: 'Event',
        initialize: Event,
        protect: true
    });

    Event.implement({
        stop: function() {
            return this.stopPropagation().preventDefault();
        },

        stopPropagation: function() {
            if (this.event.stopPropagation) {
                this.event.stopPropagation();
            }
            else {
                this.event.cancelBubble = true;
            }

            return this;
        },

        preventDefault: function() {
            if (this.event.preventDefault) {
                this.event.preventDefault();
            }
            else {
                this.event.returnValue = false;
            }

            return this;
        }
    });

    $.Event = Event;
})(JUI);