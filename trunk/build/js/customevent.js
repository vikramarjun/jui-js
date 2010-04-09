/*
* Author:
*   xushengs@gmail.com
*   http://fdream.net/
* */
(function ($) {
    // add to loaded module-list
    //$.register('customevent', '1.0.0.0');

    var CustomEvent = function (name) {
        this.events = [];
        this.name = name;
    };

    $.Native.initialize({
        name: 'CustomEvent',
        initialize: CustomEvent,
        protect: true
    });

    CustomEvent.implement({
        fire: function () {
            var args = [];
            for (var i = 0; i < arguments.length; i++) {
                args.push(arguments[i]);
            }
            for (var i = 0, len = this.events.length; i < len; i++) {
                var et = this.events[i];
                et[0].call(et[1], this.name, args);
            }
        },

        subscribe: function (fn, scope) {
            this.events.push([fn, scope]);
        },

        clear: function () {
            this.events = [];
        }
    });

    $.CustomEvent = CustomEvent;
})(JUI);    