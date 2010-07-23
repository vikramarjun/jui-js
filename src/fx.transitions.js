/*
* Author:
*   xushengs@gmail.com
*   http://fdream.net/
* */
/*
* requires:
*   fx.js
*
* */

(function($) {
    // add to loaded module-list
    //$.register('fx.transitions', '1.0.0.0');

    /*
    * Easing Equations by Robert Penner
    * http://www.robertpenner.com/easing/
    * Modified from mootools
    * http://mootools.net
    * 
    **/
    var transitions = {
        Linear: function(p) {
            return p;
        },

        Pow: function(p, x) {
            return Math.pow(p, x || 6);
        },

        Expo: function(p) {
            return Math.pow(2, 8 * (p - 1));
        },

        Circ: function(p) {
            return 1 - Math.sin(Math.acos(p));
        },

        Sine: function(p) {
            return 1 - Math.sin((1 - p) * Math.PI / 2);
        },

        Back: function(p, x) {
            x = x || 1.618;
            return Math.pow(p, 2) * ((x + 1) * p - x);
        },

        Bounce: function(p) {
            var value;
            for (var a = 0, b = 1; 1; a += b, b /= 2) {
                if (p >= (7 - 4 * a) / 11) {
                    value = b * b - Math.pow((11 - 6 * a - 11 * p) / 4, 2);
                    break;
                }
            }
            return value;
        },

        Elastic: function(p, x) {
            return Math.pow(2, 10 * --p) * Math.cos(20 * p * Math.PI * (x || 1) / 3);
        },

        Vibration: function(p) {
            return -Math.pow(Math.E, -5 * p) * Math.cos(p / 18 * 500) + 1;
        },

        Swing: function(p) {
            return -Math.cos(p * Math.PI) / 2 + 0.5;
        }
    };

    var ts = ['Quad', 'Cubic', 'Quart', 'Quint'], i = 0, t;
    while (t = ts[i]) {
        transitions[t] = function(p) {
            return Math.pow(p, i + 2);
        };
        i++;
    }

    $.Fx.Transitions = {};

    for (t in transitions) {
        $.Fx.Transitions[t] = (function(t) {
            return {
                easeIn: function(pos, seg) {
                    return transitions[t](pos, seg);
                },
                easeOut: function(pos, seg) {
                    return 1 - transitions[t](1 - pos, seg);
                },
                easeInOut: function(pos, seg) {
                    return (pos <= 0.5) ? transitions[t](2 * pos, seg) / 2 : (2 - transitions[t](2 * (1 - pos), seg)) / 2;
                }
            }
        })(t);
    }
})(JUI);