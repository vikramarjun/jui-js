/*
* Author:
*   xushengs@gmail.com
*   http://fdream.net/
* */

(function($) {

    var LazyImage = function(options) {
        options = options || {};
        var mode = options.mode || 'dynamic',
        delay = options.delay || 200,
            attr = options.attr || 'lazy-src',
            doc = options.document || document,
            container = options.container || document;

        var isWindow = container == window
                       || container == doc
                       || !container.tagName
                       || (/^(?:body|html)$/i).test(container.tagName);

        container = $(container);

        var images = [], tmid = 0;

        (function() {
            if (container.querySelectorAll) {
                images = $(container.querySelectorAll('img[' + attr + ']'));
            }
            else {
                var img, i = 0, imgs = container.getElementsByTagName('img');
                while (img = imgs[i++]) {
                    (img[attr] !== undefined) && images.push(img);
                }
            }
        })();

        function simpleDelay(view, dr, prop) {
            var img, i = 0, count = 0, pos, size, vy = view[dr] + view[prop];
            while (img = images[i]) {
                img = $(img);
                pos = img.position();
                size = img.dimension();
                if ((view[dr] < pos[dr] + size[prop]) && vy > pos[dr]) {
                    $.log(img.attr(attr));
                    img.src = img.attr(attr);
                    count++;
                }
                else if (count) {
                    break;
                }
                i++;
            }
            (count > 0) && images.splice(i - count, count);
        }

        var modeLoader = {
            'vertical': function(view) {
                simpleDelay(view, 'y', 'height');
            },
            'horizontal': function(view) {
                simpleDelay(view, 'x', 'width');
            },
            'dynamic': function(view) {
                var img, i = 0, pos, size, count = 0, vy = view.y + view.height, vx = view.x + view.width;
                while (img = images[i]) {
                    img = $(img);
                    pos = img.position();
                    size = img.dimension();
                    if (view.x < pos.x + size.width && vx > pos.x && view.y < pos.y + size.height && vy > pos.y) {
                        img.src = img.attr(attr);
                        count++;
                    }
                    else if (count > 0) {
                        images.splice(i - count, count);
                        count = 0;
                    }
                    i++;
                }
                (count > 0) && (images.splice(i - count, count));
            }
        };
        modeLoader.y = modeLoader.v = modeLoader.vertical;
        modeLoader.x = modeLoader.h = modeLoader.horizontal;

        function startLoad() {
            var view = isWindow ? window.scrollPos() : { x: container.attr('scrollLeft'), y: container.attr('scrollTop') },
                size = isWindow ? window.dimension() : container.dimension();
            (images.length > 0) && modeLoader[mode]({ x: view.x, y: view.y, width: size.width, height: size.height });
        }

        function delayLoad() {
            clearTimeout(tmid);
            setTimeout(startLoad, delay);
        }

        container = $(isWindow ? window : container);
        container.addEvent('scroll', delayLoad);
        isWindow && container.addEvent('resize', delayLoad);

        this.load = function() {
            startLoad();
        };
    };

    $.LazyImage = LazyImage;
})(JUI);
