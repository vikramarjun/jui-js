/*
* Author:
*   xushengs@gmail.com
*   http://fdream.net/
* */
/*
* requires:
*   element.js
*   event.js
*   drag.js
*
* */
(function($) {
    // add to loaded module-list
    $.register('drag.move', '1.0.0.0');

    function mergeOptions(o, n) {
        for (var p in n) {
            o[p] = n[p];
        }

        return o;
    }

    var Move = function(dom, options) {
        var _dom = $(dom),
            _options = {
                // events
                onStart: $.empty,
                onSnap: $.empty,
                onDrag: $.empty,
                onStop: $.empty,
                // settings
                //snap: 6,
                //unit: 'px',
                //grid: false,
                //style: true,
                limit: false,
                handle: false,
                //invert: false,
                modifiers: { x: 'left', y: 'top' }
            },
            _handle,
            _limit,
            _modifiers,
            _start = {},
            _current = {};

        _options = mergeOptions(_options, options);
        _handle = _options.handle;
        _limit = _options.limit;
        _modifiers = _options.modifiers;
        if ($.type(_handle) === 'array') {
            _handle = new $.Elements(_handle);
        }
        else if (_handle) {
            _handle = $(_handle);
        }
        else {
            _handle = _dom;
        }

        // 继承父类的方法
        this.constructor.superclass.constructor.apply(this, [_handle]);

        function check(current, limit) {
            if ($.check(limit[0]) && current < limit[0]) {
                current = limit[0];
            }
            if ($.check(limit[1]) && current > limit[1]) {
                current = limit[1];
            }
            return current;
        }

        this.onDrag = function(evt, value) {
            _current.x = _start.x + value.x;
            _current.y = _start.y + value.y;
            if (_limit) {
                _limit.x && (_current.x = check(_current.x, _limit.x));
                _limit.y && (_current.y = check(_current.y, _limit.y));
            }
            for (var p in _modifiers) {
                _dom.setStyle(_modifiers[p], _current[p]);
            }
            _options.onDrag(evt, value);
        };

        this.onStart = function(evt) {
            _start = _dom.position();
            _options.onStart(evt);
        };

        this.onStop = function(evt) {
            _options.onStop(evt);
        };

        _dom.setStyle('position', 'absolute');
    };


    $.Native.initialize({
        name: 'Drag.Move',
        initialize: Move,
        protect: true
    });

    Move = $.extend(Move, $.Drag);

    $.Drag.Move = Move;
})(JUI);