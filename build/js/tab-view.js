/*
* Author:
*   xushengs@gmail.com
*   http://fdream.net/
* */
(function($) {
    $.register('tab-view', '1.0.0.0');

    var TabView = function(tabs, views, tabChangeCallBack, ops) {
        if (tabs.length != views.length) {
            alert('JUI:TabView  参数 [tabs] [views] 包含的element.length不相等');
            return;
        }
        this.ops = {
            tabTriggerEvent: 'mouseover'
        };
        this.mergeOptions(ops);

        for (var i = 0, len = tabs.length; i < len; i++) {
            tabs[i].attr('jsvalue', i);
        }
        this.selectedTabIx = 0;
        var self = this;


        tabs.addEvent(this.ops.tabTriggerEvent, function(ev) {
            var ix = parseInt(this.attr('jsvalue'));
            tabChangeCallBack(tabs[self.selectedTabIx], this);

            views[self.selectedTabIx].css('display', 'none');

            self.selectedTabIx = ix;
            
            views[self.selectedTabIx].css('display', 'block');
        });
    };

    $.Native.initialize({
        name: 'TabView',
        initialize: TabView,
        protect: true
    });

    TabView.implement({
        mergeOptions: function(ops) {
            for (var p in ops) {
                this.ops[p] = ops[p];
            }
        }
    });

    TabView.alias({ contains: 'tabview' });

    $.TabView = TabView;

})(JUI);