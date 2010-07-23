/*
* Author:
*   xushengs@gmail.com
*   http://fdream.net/
* */
/*
* requires:
*   jui.js
*
* usage:
*   $.log(info, color);
*     @info: text or html codes
*     @color: (optional) must be css color string or the value in this list:
*             [0, error, 1, warn, 2, info]
* */

(function($) {

    function addCSS(cssText) {
        var css = document.createElement('style');
        css.type = 'text/css';
        //IE
        if (css.styleSheet) {
            css.styleSheet.cssText = cssText;
        }
        //firefox, maybe others too...	
        else {
            css.appendChild(document.createTextNode(cssText));
        }
        document.getElementsByTagName('head')[0].appendChild(css);
    }

    function addEvent(obj, type, fn) {
        if (obj.attachEvent) {
            obj.attachEvent('on' + type, fn);
        }
        else if (obj.addEventListener) {
            obj.addEventListener(type, fn, false);
        }
    }

    var cssText = '.logger_box{position:absolute;left:0;margin:0;padding:32px 0 0 0;text-align:left;width:360px;height:270px;font-size:12px;background:#000;color:#FFF;border:4px solid #333;border-top:none;border-bottom:none;font-family:Consolas,"Courier New","宋体";}\
                    .logger_box .toolbar{position:relative;top:-32px;margin:0;padding:4px 96px 4px 4px;background:#333;color:#fff;font-size:12px;font-weight:normal;line-height:20px;text-align:left;}\
                    .logger_box .toolbar input{text-align:left;border:1px solid #000;padding:2px 4px;width:100%;}\
                    .logger_box .tools{position:absolute;width:96px;right:2px;top:6px;display:inline-block;*display:inline;*zoom:1;font-size:18px;vertical-align:middle;}\
                    .logger_box .tools a{line-height:20px;text-align:center;width:20px;height:20px;overflow:hidden;display:block;float:right;vertical-align:middle;text-decoration:none;}\
                    .logger_box a.scroll{font-size:12px;}\
                    .logger_box a.size{font-size:10px;}\
                    .logger_box a.pop{font-size:14px;}\
                    .logger_box a.close{font-size:16px;}\
                    .logger_box a.scroll:hover, .logger_box a.size:hover, .logger_box a.pop:hover, .logger_box a.close:hover{background:#666;}\
                    .logger_box a{color:#0cf;}\
                    .logger_box ul{margin:-32px 0 0 0;padding:0;line-height:16px;list-style-type:none;height:100%;overflow:auto;}\
                    .logger_box li{border-bottom:1px solid #333;padding:4px;}\
                    .logger_box li.info{color:#0f0;}\
                    .logger_box li.warn{color:#ff0;}\
                    .logger_box li.error{color:#f00;}',
        logwin = null, winbox = null, wininput = null, winscroll = null, autoScroll = true,
        cmds = [], cmdIndex = 0,
        inputId = '_jui_logger_input', containerId = '_jui_logger_container', scrollId = '_jui_logger_scroll';

    addCSS(cssText);

    var frag = document.createDocumentFragment();
    var box = document.createElement('div');
    box.className = 'logger_box';

    var bar = document.createElement('div');
    bar.className = 'toolbar';
    box.appendChild(bar);

    var input = document.createElement('input');
    input.type = 'text';
    input.id = inputId;
    bar.appendChild(input);
    addEvent(input, 'keydown', boxExec);

    var tools = document.createElement('div');
    tools.className = 'tools';
    bar.appendChild(tools);

    var close = document.createElement('a');
    close.innerHTML = '×';
    close.title = '关闭窗口';
    close.href = 'javascript:;';
    close.className = 'close';
    tools.appendChild(close);
    addEvent(close, 'click', closeDebug);

    var pop = document.createElement('a');
    pop.innerHTML = '□';
    pop.title = '新窗口显示';
    pop.href = 'javascript:;';
    pop.className = 'pop';
    tools.appendChild(pop);
    addEvent(pop, 'click', popDebug);

    var size = document.createElement('a');
    size.innerHTML = '∨';
    size.title = '向下缩小';
    size.href = 'javascript:;';
    size.className = 'size';
    tools.appendChild(size);
    addEvent(size, 'click', toggleDebug);

    var scroll = document.createElement('a');
    scroll.innerHTML = '■'; //■▶
    scroll.title = '停止自动滚动';
    scroll.href = 'javascript:;';
    scroll.className = 'scroll';
    scroll.id = scrollId;
    tools.appendChild(scroll);
    addEvent(scroll, 'click', toggleScroll);

    var con = document.createElement('ul');
    con.id = containerId;
    box.appendChild(con);

    frag.appendChild(box);

    function escapeHTML(txt) {
        return txt.toString().replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/ /g, '&nbsp;').replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;').replace(/\r?\n/g, '<br />');
    }

    function boxExec(evt) {
        evalScriptHandler((evt || window.event).keyCode, input);
    }

    function evalScriptHandler(code, input) {
        if (code == '13') {
            var txt = input.value;
            input.value = '';
            Debugger.log('>>> ' + escapeHTML(txt));
            if (/^\s+$/.test(txt)) {
                return;
            }
            while (cmds.length >= 50) {
                cmds.shift();
            }
            cmds.push(txt);
            cmdIndex++;

            if (!/((?:var)|(?:function) )|=/.test(txt.replace(/(?:'.*?[^\\]')|(?:".*?[^\\]")/, txt))) {
                var ret = window.eval(txt);
                (ret != undefined) && $.log(ret);
                return;
            }
            if (window.execScript) {
                window.execScript(txt);
            }
            else {
                window.eval(txt);
            }
        }
        else if (code == 38) {
            if (cmds.length > 0 && cmdIndex > 0) {
                input.value = cmds[--cmdIndex];
            }
            else {
                input.value = '';
            }
        }
        else if (code == 40) {
            if (cmdIndex < cmds.length) {
                input.value = cmds[cmdIndex++];
            }
            else {
                input.value = '';
            }
        }
    }

    function toggleScroll() {
        if (autoScroll) {
            autoScroll = false;
            scroll.innerHTML = '▶';
            scroll.title = '启动自动滚动';
            scroll.style.fontSize = '18px';
            if (winscroll) {
                winscroll.innerHTML = '▶';
                winscroll.title = '启动自动滚动';
                winscroll.style.fontSize = '18px';
            }
        }
        else {
            autoScroll = true;
            scroll.innerHTML = '■';
            scroll.title = '停止自动滚动';
            scroll.style.fontSize = '12px';
            if (winscroll) {
                winscroll.innerHTML = '■';
                winscroll.title = '停止自动滚动';
                winscroll.style.fontSize = '12px';
            }
            scrollToBottom();
        }
    }

    function toggleDebug() {
        if ((size.state || 'large') == 'large') {
            con.style.display = 'none';
            size.state = 'mini';
            size.innerHTML = '∧';
            size.title = '向上放大';
        }
        else {
            size.state = 'large';
            con.style.display = 'block';
            size.innerHTML = '∨';
            size.title = '向下缩小';
        }
        layout();
        this.blur();
    }

    function popDebug() {
        logwin = window.open('', 'jui_debugger', ['width=', box.offsetWidth + 20, ',height=', box.offsetHeight, ',', 'scrollbars=yes,resizable=yes,status=no,', 'location=no,menubar=no,toolbar=no'].join(''));
        logwin.moveTo(0, window.screen.availHeight - box.offsetHeight);
        logwin.document.write('<html><head><title>JUI Logger for Javascript</title><style type="text/css">html,body{margin:0;background:#000;padding:0;overflow:hidden;height:100%;width:100%;}' + cssText + '</style></head><body><div class="logger_box" style="border:none;width:100%;height:100%;">' + box.innerHTML + '</div></body></html>');
        winbox = logwin.document.getElementById(containerId);
        winbox.innerHTML = con.innerHTML;
        wininput = logwin.document.getElementById(inputId);
        winscroll = logwin.document.getElementById(scrollId);
        addEvent(wininput, 'keydown', winExec);
        addEvent(winscroll, 'click', toggleScroll);
        addEvent(window, 'beforeunload', resetWindow);
        box.style.display = 'none'
        scrollToBottom();
        this.blur();
    }

    function resetWindow() {
        logwin = null;
    }

    function closeDebug() {
        box.style.display = 'none';
    }

    function showDebug() {
        box.style.display = 'block';
        layout();
        scrollToBottom();
    }

    function winExec(evt) {
        evalScriptHandler((evt || window.event).keyCode, wininput);
    }

    //∧∨ˇˉ+_□×＾￣＿

    function appendBox() {
        if (document.body) {
            document.body.appendChild(frag);
            addEvent(window, 'resize', layout);
            addEvent(window, 'scroll', layout);
            layout();
            con.scrollTop = con.scrollHeight - con.offsetHeight;
        }
        else {
            setTimeout(appendBox, 100);
        }
    }

    function layout() {
        box.style.top = ((document.documentElement.clientHeight || document.body.clientHeight) + (document.documentElement.scrollTop || document.body.scrollTop) - box.offsetHeight) + 'px';
    }

    function scrollToBottom() {
        if (autoScroll) {
            con.scrollTop = con.scrollHeight;
            if (logwin && winbox) {
                winbox.scrollTop = winbox.scrollHeight;
            }
        }
    }


    var Debugger = {
        init: function() {
            setTimeout(appendBox, 100);
        },

        log: function(info, level) {
            ///<summary>
            /// 记录debug信息
            ///</summary>
            ///<param name="info" type="OBJECT">
            ///   debug信息
            ///</param>
            ///<param name="level" type="OBJECT">
            ///   debug级别：
            ///     0: 错误
            ///     1: 警告
            ///     2: 信息
            ///</param>

            info = (info === undefined) ? 'undefined' : (info === null ? null : info);

            var li = document.createElement('li');
            switch (level = '' + level) {
                case '0':
                case 'error':
                    li.className = 'error';
                    break;
                case '1':
                case 'warn':
                    li.className = 'warn';
                    break;
                case '2':
                case 'info':
                    li.className = 'info';
                    break;
                case '':
                case 'undefined':
                case 'null':
                case 'NaN':
                    break;
                default:
                    li.style.color = level;
                    break;
            }
            li.innerHTML = escapeHTML(info);
            con.appendChild(li);
            if (logwin && winbox) {
                var wli = logwin.document.createElement('li');
                wli.className = li.className;
                wli.innerHTML = li.innerHTML;
                winbox.appendChild(wli);
            }
            scrollToBottom();
        }
    };

    Debugger.init();
    Debugger.log('debugger started!', 2);

    function showDebugHandler(evt) {
        var evt = evt || window.event;
        var code = evt.which || evt.keyCode;
        if (evt.shiftKey && evt.ctrlKey) {
            (code == 36) ? showDebug() : (code == 35 && closeDebug());
        }
    }
    addEvent(document, 'keydown', showDebugHandler);

    window.onerror = function(description, file, errorLineNum) {
        Debugger.log(['错误描述：' + description, '错误文件：' + file, '错误行数：' + errorLineNum].join('\n'), 0);
        return true;
    }

    $.Debugger = Debugger;
    $.log = Debugger.log;
})(JUI);