(function($) {
    // add to loaded module-list
    $.register('ajax', '1.0.0.0');

    var _options = {
        url: null,
        method: 'get',
        data: null,
        async: true,
        encoding: 'utf-8',
        headers: null,
        cache: false,
        link: 'ignore',
        type: 'xml'
    };

    function mergeOptions(options) {
        for (var p in options) {
            _options = options[p];
        }
    }

    var Ajax = function(options) {
        mergeOptions(options);

        return this;
    };

    $.Native.initialize({
        name: 'Ajax',
        initialize: Ajax,
        protect: true
    });

    Ajax.implement({
        send: function(options) {
            mergeOptions(options);

        },

        cancel: function() {
        }
    });

    $.Ajax = Ajax;
})(JUI);