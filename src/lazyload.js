/*
* Author:
*   xushengs@gmail.com
*   http://fdream.net/
* */

(function($) {

    var LazyImage = function(options) {
        options = options || {};
        var delay = options.delay || 200,
            attr = options.attr || 'lazy-src',
            container = options.container || document,
            doc = options.document || document;

        var isWindow = container == window
                       || container == doc
                       || !container.tagName
                       || (/^(?:body|html)$/i).test(container.tagName);

        container = $(container);

        var images = [], tmid = 0, overflow = { auto: 1, scroll: 1 }, noscroll = isWindow ? false : !!overflow[container.css('overflow').toLowerCase()];

        (function() {
            var img, i = 0, imgs = container.getElements('img'), pos, dim, cpos;
            while (img = imgs[i++]) {
                (img.attr(attr) !== undefined) && images.push(img);
            }
        })();

        function load(view) {
            var img, i = 0, pos, dim, count = 0, start = 0, vy = view.y + view.height, vx = view.x + view.width;
            while (img = images[i]) {
                pos = img.position();
                dim = img.dimension();
                if (view.x < pos.x + dim.width && vx > pos.x && view.y < pos.y + dim.height && vy > pos.y) {
                    img.src = img.attr(attr);
                    count++;
                    i++;
                }
                else if (count > 0) {
                    images.splice(i -= count, count)
                    count = 0;
                }
                else {
                    i++;
                }
            }
            (count > 0) && images.splice(i - count, count);

            // completed, remove all events
            if (images.length == 0) {
                container.removeEvent('scroll', delayLoad);
                isWindow && container.removeEvent('resize', delayLoad);
            }
        }

        function startLoad() {
            var view = isWindow ? window.scrollPos() : (noscroll ? { x: 0, y: 0} : { x: container.scrollLeft, y: container.scrollTop }),
                size = isWindow ? window.dimension() : container.dimension();
            (images.length > 0) && load({ x: view.x, y: view.y, width: size.width, height: size.height });
        }

        function delayLoad() {
            clearTimeout(tmid);
            tmid = setTimeout(startLoad, delay);
        }

        container = $(isWindow ? window : container);
        container.addEvent('scroll', delayLoad);
        isWindow && container.addEvent('resize', delayLoad);
        delayLoad();

        // 强制重新检查，主要用于TAB内容检测
        this.load = function() {
            startLoad();
        };
    };

    $.LazyImage = LazyImage;
})(JUI);
