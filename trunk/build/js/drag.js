/*
* Author:
*   xushengs@gmail.com
*   http://fdream.net/
* */
/*
* requires:
*   element.js
*   event.js
*
* */
(function($) {
    // add to loaded module-list
    $.register('drag', '1.0.0.0');

    function mergeOptions(o, n) {
        for (var p in n) {
            o[p] = n[p];
        }

        return o;
    }

    var Drag = function(handle) {
        var _doc = $(document),
            _handle = handle,
            _start = {},
            _self = this;

        function attach() {
            _handle.addEvent('mousedown', start);
        }

        function detach() {
            _handle.removeEvent('mousedown', start);
        }

        function start(evt) {
            if (evt.rightClick) {
                return;
            }
            _start = evt.page;
            _self.onStart(evt);

            if (_handle.setCapture) {
                _handle.setCapture();
            }
            else if (window.captureEvents) {
                window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);
            }
            _doc.addEvents({ 'mousemove': check, 'mouseup': stop });
        }

        function stop(evt) {
            if (_handle.releaseCapture) {
                _handle.releaseCapture();
            }
            else if (window.captureEvents) {
                window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);
            }
            _doc.removeEvents({ 'mousemove': check, 'mouseup': stop });
            _self.onStop(evt);
        }

        function check(evt) {
            var p = evt.page;
            _self.onDrag(evt, { x: p.x - _start.x, y: p.y - _start.y });
        }

        this.onStart = function(evt) {
            return evt;
        };

        this.onDrag = function(evt, value) {
            /* it should contains: 
            * {
            *    x: (total changed value of x)
            *    y: (total changed value of y)
            * }
            **/
            return evt;
        };

        this.onStop = function(evt) {
            return evt;
        };

        this.detach = function() {
            // you should not override this method
            detach();
            return this;
        };

        this.attach = function() {
            // you should not override this method
            attach();
            return this;
        };

        attach();
    };

    $.Native.initialize({
        name: 'Drag',
        initialize: Drag,
        protect: true
    });

    $.Drag = Drag;
})(JUI);