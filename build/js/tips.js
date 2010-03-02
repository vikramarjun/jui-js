/*
 * Author:
 *   xushengs@gmail.com
 *   http://fdream.net/
 * */
(function($) {
    // add to loaded module-list
    $.register('tips', '1.0.0.0');

    var Tips = function() {
        var div = new $.Element('div', {
            'style': {
                'position': 'absolute',
                'z-index': 1000,
                'top': 0,
                'left': 0,
                'display': 'none',
                'padding': '8px',
                'border': '1px solid #666',
                'background': '#fff8f0',
                'color': '#333',
                'font-size': '12px'
            }
        });

        if (!document.body) {
            return;
        }

        div.inject(document.body);

        var hideTimeout = null, delay = 3000;

        function hide() {
            div.css('display', 'none');
        }

        function text(txt) {
            div.html(txt);
        };

        this.show = function(position, txt, autoHide) {
            div.css({ 'left': position.x || 0, 'top': position.y || 0, 'display': 'block' });

            if (txt) {
                text(txt);
            }

            try {
                clearTimeout(hideTimeout);
            }
            catch (e) {
            }

            if (autoHide) {
                hideTimeout = setTimeout(hide, delay);
            }
        };

        this.hide = function() {
            hide();
        };
    };

    $.Native.initialize({
        name: 'Tips',
        initialize: Tips,
        protect: false
    });

    $.Tips = Tips;
})(JUI);