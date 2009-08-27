(function($) {
    // add to loaded module-list
    $.register('element', '1.0.0.0');

    // browser detection
    $.browser = {};      // user agents
    (function() {
        $.browser = {
            ie: 0,          // Internet Explorer
            opera: 0,       // Opera
            gecko: 0,       // Mozilla Firefox
            webkit: 0,      // Apple Safari & Google Chrome
            mobile: null    // Mobile Platform
        };

        var ua = navigator.userAgent, m;

        // Modern KHTML browsers should qualify as Safari X-Grade
        if ((/KHTML/).test(ua)) {
            $.browser.webkit = 1;
        }
        // Modern WebKit browsers are at least X-Grade
        m = ua.match(/AppleWebKit\/([^\s]*)/);
        if (m && m[1]) {
            $.browser.webkit = parseFloat(m[1]);

            // Mobile browser check
            if (/ Mobile\//.test(ua)) {
                $.browser.mobile = "Apple"; // iPhone or iPod Touch
            } else {
                m = ua.match(/NokiaN[^\/]*/);
                if (m) {
                    $.browser.mobile = m[0]; // Nokia N-series, ex: NokiaN95
                }
            }
        }

        if (!$.browser.webkit) { // not webkit
            // @todo check Opera/8.01 (J2ME/MIDP; Opera Mini/2.0.4509/1316; fi; U; ssr)
            m = ua.match(/Opera[\s\/]([^\s]*)/);
            if (m && m[1]) {
                $.browser.opera = parseFloat(m[1]);
                m = ua.match(/Opera Mini[^;]*/);
                if (m) {
                    $.browser.mobile = m[0]; // ex: Opera Mini/2.0.4509/1316
                }
            } else { // not opera or webkit
                m = ua.match(/MSIE\s([^;]*)/);
                if (m && m[1]) {
                    $.browser.ie = parseFloat(m[1]);
                } else { // not opera, webkit, or ie
                    m = ua.match(/Gecko\/([^\s]*)/);
                    if (m) {
                        $.browser.gecko = 1; // Gecko detected, look for revision
                        m = ua.match(/rv:([^\s\)]*)/);
                        if (m && m[1]) {
                            $.browser.gecko = parseFloat(m[1]);
                        }
                    }
                }
            }
        }
    })();
})(JUI);