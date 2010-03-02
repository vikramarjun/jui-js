/*
* Author:
*   xushengs@gmail.com
*   http://fdream.net/
* */
(function($) {
    $.register('photo-slide', '1.0.0.0');

    var PhotoSlide = function() {

        //可选参数默认值
        this.ops = {
            //切换按钮触发事件
            btnTriggerEvent: 'click',

            //自动切换频率时间,小于1为不自动切换
            autoSwitchTime: 5000
        };
    };

    $.Native.initialize({
        name: 'PhotoSlide',
        initialize: PhotoSlide,
        protect: true
    });

    PhotoSlide.implement({
        //根据模板创建控件实例
        createByTemplate: function(tp, width, height, op) {
            this.width = width;
            this.height = height;

            this.mergeOptions(op);

            this.tpEl = tp;
            this.init();
        },

        mergeOptions: function(ops) {
            for (var p in ops) {
                this.ops[p] = ops[p];
            }
        },

        beginAutoSwitch: function() {
            if (this.ops.autoSwitchTime < 1 && this.pageCount < 2) {
                return;
            }
            clearInterval(this.sid);
            var self = this;
            this.sid = setInterval(function() {
                var pn = 0;
                if (self.selectedPageNum < self.pageCount - 1) {
                    pn = self.selectedPageNum + 1;
                }
                self.changePage(pn);

            }, this.ops.autoSwitchTime);
        },

        stopAutoSwitch: function() {
            clearInterval(this.sid);
        },

        init: function() {
            this.picsEl = this.tpEl.getElement('div.pics')[0];
            this.picsEl.css({ 'width': this.width, 'height': this.height, 'overflow': 'hidden' });

            this.picsMoveEl = this.picsEl.getElement('div');
            this.picsMoveEl.css({ 'height': this.height, 'overflow': 'hidden' });


            this.fx = new $.Fx.Morph(this.picsMoveEl, { duration: 500, effect: 'Quad:in:out' });

            this.titleEl = this.tpEl.getElement('div.info .title');
            this.btnsEl = this.tpEl.getElement('div.info .btns');

            if (this.titleEl.length != 0) { this.titleEl = this.titleEl[0]; }
            if (this.btnsEl.length != 0) { this.btnsEl = this.btnsEl[0]; }


            this.tpEl.addEvent('mouseover', function(ev) {
                this.stopAutoSwitch();
            }, this);

            this.tpEl.addEvent('mouseout', function(ev) {
                this.beginAutoSwitch();
            }, this);

            this.fnc();
        },

        fnc: function() {
            this.selectedPageNum = 0;

            this.infos = [];

            var els = this.picsMoveEl.getElements('div');
            this.pageCount = els.length;
            this.picsMoveEl.css('width', this.pageCount * this.width);
            var s = [];
            for (var i = 0, len = this.pageCount; i < len; i++) {
                els[i].css({ 'width': this.width, 'height': this.height, 'overflow': 'hidden', 'float': 'left' });
                s.push(['<a href="javascript:;">', i + 1, '</a>'].join(''));

                var aels = els[i].getElements('a');
                if (aels.length > 0) {
                    this.infos.push({ title: aels[0].attr('title'), link: aels[0].attr('href') });
                } else {
                    this.infos.push({ title: 'No Text', link: '' });
                }
            }

            if (this.btnsEl != null) {
                this.btnsEl.html(s.join(''));
                var btns = this.btnsEl.getElements('a');

                //bind event
                btns.addEvent(this.ops.btnTriggerEvent, function(ev) {
                    var ix = parseInt($(ev.target).html()) - 1;
                    this.changePage(ix);
                }, this);
            }

            this.changePage(0);

            this.beginAutoSwitch();
        },

        changePage: function(ix) {
            if (this.btnsEl != null) {
                var btns = this.btnsEl.getElements('a');
                btns[this.selectedPageNum].className = '';
                btns[ix].className = 'now';
            }

            if (this.titleEl != null) {
                var info = this.infos[ix];
                this.titleEl.html(info.title);
                this.titleEl.attr('href', info.link);
            }

            this.selectedPageNum = ix;

            this.fx.start({ 'margin-left': -(this.selectedPageNum * this.width) });
        },

        /*
        list:
        [
        {title:'', picUrl:'', linkUrl:''}
        ]
        */
        setPics: function(list) {
            this.fnc();
        }
    });

    PhotoSlide.alias({ contains: 'photoslide' });

    $.PhotoSlide = PhotoSlide;

})(JUI);