/**
* whiz.js
*   Whiz CSS Selector Engine
* 
* Version:
*   1.0.0.0
* 
* Author:
*   xushengs@gmail.com
*
*/
var whiz = function(selector, context, firstOnly) {
    // TODO: handle empty string
    if (!selector || typeof selector !== "string") {
        return [];
    }

    context = context || document;

    if (context.nodeType !== 1 && context.nodeType !== 9) {
        return [];
    }

    var lastIndex = 0,
        results = [],
        tagRE = /^((?:-?[_a-z]+[\w-]*)|\*)/i, // tag must be the first, or it will be *
    //quick = /^#?([\w-]+)/i,
        patterns = {
            //tag: /^((?:-?[_a-z]+[\w-]*)|\*)/i,
            id: /^#([\w-]+)/,
            klass: /^\.([\w-]+)/,
            attribute: /^\[([a-z]+\w*)+([~\|\^\$\*!]?=)?['"]?([^\]]*?)['"]?\]/i,
            pseudo: /^:([\-\w]+)(?:\(['"]?(.+)['"]?\))*/,
            combinator: /^\s*?((?:[>+~\s,])|$)\s*/    // comma for multi-selectors
        };

    function parseToken(s) {
        var m = null, ret = null;
        for (var r in patterns) {
            m = s.match(patterns[r]);
            if (m) {
                ret = [{ type: r, match: m }, s.substring(m[0].length)];
                break;
            }
        }
        //console.log('string: ' + s);
        //console.dir(ret);
        return ret;
    }

    function parseSingle(s) {
        var m = null, pr = null, f = null, singleSelector = { tag: '*', filters: [] }, combinator = '';

        // find tag
        m = s.match(tagRE);
        if (m) {
            singleSelector.tag = m[1];
            s = s.substring(m[0].length);
        }

        // find filters
        while (s.length > 0) {
            pr = parseToken(s);
            if (!pr) {
                break;
            }
            f = pr[0];
            s = pr[1];
            // if a selector ended
            if (f.type == 'combinator') {
                combinator = f.match[1];
                break;
            }
            else {
                //console.log(f);
                singleSelector.filters.push(f);
            }
        }
        return [singleSelector, combinator, s];
    }

    function filter(items, filter) {
        //alert([filter.type, filter.m]);
    };

    function combine(selector, context, combinator) {
        //console.log('combine ended=' + combinator);
        return [];
    }

    function querySubSelectors(s, contexts, firstOnly) {
        var single = null, ret = contexts;
        do {
            single = parseSingle(s);
            if (single) {
                s = single[2];
                ret = combine(single[0], ret, single[1]);
            }
            else {
                s = '';
                break;
            }
        }
        while (single[1] != ',' && s.length > 0);

        return [ret, s];
    }

    function query(s, contexts, firstOnly) {
        console.time('query');
        var ret = null;
        while (s.length > 0) {
            //console.log('===================');
            ret = querySubSelectors(s, contexts, firstOnly);
            s = ret[1];
            //console.log('===================');
        }
        console.timeEnd('query');
    }

    query(selector, [context], firstOnly);
};