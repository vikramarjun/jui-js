/*
 * Author:
 *   xushengs@gmail.com
 *   http://fdream.net/
 * */
(function($) {
    // add to loaded module-list
    $.register('fx', '1.0.0.0');

    function mergeOptions(o, n) {
        for (var p in n) {
            o[p] = n[p];
        }

        return o;
    }

    function capitalize(str) {
        return str.replace(/\b[a-z]/g, function(match) {
            return match.toUpperCase();
        });
    }

    var Fx = function(options) {
        var _options = {
            // events
            onStart: $.empty,
            onComplete: $.empty,
            onCancel: $.empty,
            onEnterFrame: $.empty,   // just like actionscript, it fired when it changed
            // settings
            fps: 50,        // frames per second
            duration: 500,  // duration
            unit: false,    // it canbe px, em, % and etc. TODO: implement it
            link: 'ignore', // TODO: implement it
            effect: false   // no effect in default 
        },
            _period = 20,
            _timer = null,
            _time = 0,      // current time
            _from = 0,
            _change = 0,
            _transition = function(p) {
                return p;
            },
            _self = this;

        _options = mergeOptions(_options, options);

        function move() {
            var pos = ($.now() - _time) / _options.duration;
            if (pos >= 1) {
                _self.stopTimer();
                pos = 1;
            }
            pos = _transition(pos);
            _self.change(pos);
            _options.onEnterFrame(pos);
        }

        this.change = function(value) {
            return value;
        };

        this.startTimer = function(options) {
            _options = mergeOptions(_options, options);
            _period = Math.round(1000 / _options.fps);

            if (_options.effect && $.loaded('fx.transitions')) {
                var data = _options.effect.split(':');
                _transition = $.Fx.Transitions;
                _transition = _transition[capitalize(data[0])];
                if (data[1]) {
                    _transition = _transition['ease' + capitalize(data[1]) + (data[2] ? capitalize(data[2]) : '')];
                }
            }

            _time = $.now();
            try {
                clearInterval(_timer);
            }
            catch (e) { }
            _timer = setInterval(move, _period);
            _options.onStart();
        };

        this.stopTimer = function() {
            clearInterval(_timer);
            _options.onComplete();
        };

        this.cancelTimer = function() {
            clearInterval(_timer);
            _options.onCancel();
        };

        return this;
    };

    $.Native.initialize({
        name: 'Fx',
        initialize: Fx,
        protect: false
    });

    $.Fx = Fx;
})(JUI);