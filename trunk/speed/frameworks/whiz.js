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
* Create:
*   2009-07-26
*
*/
var whiz = function(selector, context, firstOnly) {
    // TODO: handle empty string
    if (!selector || typeof selector !== "string") {
        return [];
    }

    context = context || document;
    context = context == document.body ? document : context == document.documentElement ? document : context;

    if (context.nodeType !== 1 && context.nodeType !== 9) {
        return [];
    }

    this.uid = 0;

    var lastIndex = 0,
        results = [],
        tagRE = /^((?:-?[_a-z]+[\w-]*)|\*)/i, // tag must be the first, or it will be *
        nthRE = /^(?:(?:([-]?\d*)(n{1}))?([-+]?\d*)|(odd|even))$/, // supports an+b, b, an, odd, even
    //quick = /^#?([\w-]+)/i,
        patterns = {
            id: /^#([\w-]+)/,
            klass: /^\.([\w-]+)/,
            attribute: /^\[([a-z]+\w*)+([~\|\^\$\*!]?=)?['"]?([^\]]*?)['"]?\]/i,
            pseudo: /^:([\-\w]+)(?:\(['"]?(.+?)['"]?\))*/,
            combinator: /^\s*((?:[>+~\s,])|$)\s*/    // comma for multi-selectors
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
        return ret;
    }

    function parseSingle(s) {
        var m = null, pr = null, f = null, singleSelector = { tag: '*', filters: [] }, combinator = '';

        // find tag
        m = s.match(tagRE);
        if (m) {
            singleSelector.tag = m[1].toUpperCase();
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

    // escape regular expressions
    function escapeRegExp(text) {
        return text.replace(/[-.*+?^${}()|[\]\/\\]/g, '\\$&');
    }

    // convert nodes to array
    function nodesToArray(nodes, start, end) {
        var ret = nodes, start = parseInt(start, 10), end = parseInt(end, 10);
        isNaN(start) && (start = 0);
        isNaN(end) && (end = nodes.length);

        if (!nodes.slice) {
            try {
                ret = Array.prototype.slice.call(nodes, start, end);
            } catch (e) { // IE: requires manual copy
                ret = [];
                start = start < 0 ? (start + nodes.length) : (start > nodes.length ? nodes.length : start);
                end = end < 0 ? (end + nodes.length) : (end < nodes.length ? end : nodes.length);
                while (start < end) {
                    ret[start] = nodes[start];
                    start++;
                }
            }
        }
        else {
            ret = nodes.slice(start, end);
        }
        return ret;
    }

    function testNode(node, selector) {
        var ret = false;

        if (node && node.tagName) {
            var id = node.id || ('_whiz_' + (this.uid++));
            node.id = id;
            ret = node === query(selector, [document], false, '#' + id)[0];
        }

        return ret;
    }

    // parse nth expression
    function parseExpression(expr) {
        var m, a, b;

        m = expr.match(nthRE);
        switch (m[4]) {
            case 'even':
                a = 2;
                b = 0;
                break;
            case 'odd':
                a = 2;
                b = 1;
                break;
            default:
                a = parseInt(m[1], 10);
                a = isNaN(a) ? (m[2] ? 1 : 0) : a;
                b = parseInt(m[3], 10);
                isNaN(b) && (b = 0);
                break;
        }

        return [a, b];
    }

    // judge if matches with the nth expression
    function getNth(node, expr, tag, reverse) {
        var m, a, b, siblings, ret = false, i, len;

        m = parseExpression(expr);
        a = m[0];
        b = m[1];

        siblings = node.parentNode.children;

        if (a === 0) {
            ret = reverse ? (siblings[siblings.length - b + 1]) : (siblings[b - 1] === node);
        }
        else {
            a < 0 && (a = Math.abs(a));

            if (reverse) {
                for (i = siblings.length - b, len = siblings.length; i >= 0; i -= a) {
                    if (i < len && siblings[i] === node) {
                        ret = true;
                        break;
                    }
                }
            }
            else {
                for (i = b - 1, len = siblings.length; i < len; i += a) {
                    if (i >= 0 && siblings[i] === node) {
                        ret = true;
                        break;
                    }
                }
            }
        }

        return ret;
    }

    // attribute filters
    var attributes = {
        '=': function(attr, val) {
            // value is equal to val
            //return escapeRegExp(val);
            return attr == val;
        },
        '~=': function(attr, val) {
            // value is seperated by space, one of them is equal to val
            return new RegExp('(?:^|\\s+)' + escapeRegExp(val) + '(?:\\s+|$)').test(attr);
        },
        '!=': function(attr, val) {
            // value is not equal to val
            //return '^(?!' + escapeRegExp(val) + ')$';
            return attr != val;
        },
        '^=': function(attr, val) {
            // value is started with val
            return new RegExp('^' + escapeRegExp(val)).test(attr);
        },
        '$=': function(attr, val) {
            // value is ended with val
            return new RegExp(escapeRegExp(val) + '$').test(attr);
        },
        '*=': function(attr, val) {
            // value contains val(string)
            //return attr.indexOf(val) > -1;
            return new RegExp(escapeRegExp(val)).test(attr);
        },
        '|=': function(attr, val) {
            // value is seperated by hyphen, one of them is started with val
            // optional hyphen-delimited
            return new RegExp('^' + escapeRegExp(val) + '-?').test(attr);
        }
    };

    // pseudo filters
    var pseudos = {
        // css3 selectors
        'root': function(node) {
            return node === node.ownerDocument.documentElement;
        },
        'nth-child': function(node, i, expr) {
            return getNth(node, expr);
        },
        'nth-last-child': function(node, i, expr) {
            return getNth(node, expr, null, true);
        },
        'nth-of-type': function(node, i, expr) {
            return getNth(node, expr, node.tagName);
        },
        'nth-last-of-type': function(node, i, expr) {
            return getNth(node, expr, node.tagName, true);
        },
        'first-child': function(node) {
            //return node === node.parentNode.firstChild;
            var sibling = node.parentNode.firstChild;
            while (sibling.nodeType != 1) {
                sibling = sibling.nextSibling;
            }
            return node === sibling;
        },
        'last-child': function(node) {
            var children = node.parentNode.children;
            return node === children[children.length - 1];
        },
        'first-of-type': function(node) {
            return node === node.parentNode.getElementsByTagName(node.tagName)[0];
        },
        'last-of-type': function(node) {
            var children = node.parentNode.getElementsByTagName(node.tagName);
            return node === children[children.length - 1];
        },
        'only-child': function(node) {
            var children = node.parentNode.children;
            return children.length === 1 && children[0] === node;
        },
        'only-of-type': function(node) {
            return node.parentNode.getElementsByTagName(node.tagName).length === 1;
        },
        'not': function(node, i, val) {
            return !testNode(node, val);
        },

        'enabled': function(node) {
            return node.disabled === false && node.type !== "hidden";
        },
        'disabled': function(node) {
            return node.disabled === true;
        },
        'checked': function(node) {
            return node.checked === true;
        },
        'selected': function(node) {
            // Accessing this property makes selected-by-default
            // options in Safari work properly
            node.parentNode.selectedIndex;
            return node.selected === true;
        },
        'empty': function(node) {
            return !node.firstChild;
        },
        'parent': function(node) {
            return !!node.firstChild;
        },
        'contains': function(node, i, val) {
            return (node.innerText || node.textContent || '').indexOf(val) > -1;
        },
        'visible': function(node) {
            return node.offsetWidth > 0 || node.offsetHeight > 0;
        },
        'hidden': function(node) {
            return node.offsetWidth === 0 || node.offsetHeight === 0;
        },
        'even': function(node, i) {
            return i % 2 === 0;
        },
        'odd': function(node, i) {
            return i % 2 === 1;
        },
        'nth': function(node, i, expr) {
            var m = parseExpression(expr);
            return m[0] === 0 ? i === m[1] : !((i - m[1]) % m[0]);
        },
        // only a part of them
        'gt': function(nodes, val) {
            return nodesToArray(nodes, val);
        },
        'lt': function(nodes, val) {
            return nodesToArray(nodes, 0, val);
        },
        'in': function(nodes, val) {
            var m = val.match(/(\d*)[^\d]*(\d*)/);
            return nodesToArray(nodes, m[1], m[2]);
        },
        // single result
        'eq': function(nodes, val) {
            val = parseInt(val, 10);
            return nodes.length > val ? [nodes[val]] : [];
        },
        'first': function(nodes) {
            return nodes.length > 0 ? [nodes[0]] : [];
        },
        'last': function(nodes) {
            return nodes.length > 0 ? [nodes[nodes.length - 1]] : [];
        }
    };

    var filters = {
        id: function(items, match) {
            var len = items.length, results = [];
            for (var i = 0; i < len; i++) {
                if (items[i].getAttribute('id') == match[1]) {
                    results.push(items[i]);
                }
            }
            return results;
        },
        klass: function(items, match) {
            var len = items.length, results = [];
            for (var i = 0; i < len; i++) {
                if (items[i].className == match[1]) {
                    results.push(items[i]);
                }
            }
            return results;
        },
        attribute: function(items, match) {
            var len = items.length, results = [];
            for (var i = 0; i < len; i++) {
                if (match[2]) {
                    attributes[match[2]](items[i].getAttribute(match[1]), match[3]) && results.push(items[i]);
                    //new RegExp(attributes[match[2]](match[3])).test(items[i].getAttribute(match[1])) && results.push(items[i]);
                }
                else {
                    items[i].getAttribute(match[1]) && results.push(items[i]);
                }
            }
            return results;
        },
        pseudo: function(items, match) {
            var results = [], i, len;
            switch (match[1]) {
                case 'last':
                case 'first':
                case 'gt':
                case 'lt':
                case 'in':
                    results = pseudos[match[1]](items, match[2]);
                    break;
                default:
                    for (i = 0, len = items.length; i < len; i++) {
                        pseudos[match[1]](items[i], i, match[2]) && results.push(items[i]);
                    }
                    break;
            }
            return results;
        }
    };

    function filter(items, filter) {
        var results = filters[filter.type](items, filter.match);
        return results;
    };

    var combinators = {
        ' ': function(node, tag) {
            return nodesToArray(node.getElementsByTagName(tag));
        },
        '>': function(node, tag) {
            var ns = node.children;
            len, i, results = [];
            for (var i = 0, len = ns.length; i < len; i++) {
                (ns[i].tagName == tag) && results.push(ns[i]);
            }
            return results;
        },
        '+': function(node, tag) {
            var n = node.nextSibling, ret = [];
            while (n) {
                if (n.nodeType === 1) {
                    ret = n.tagName == tag ? [n] : [];
                    break;
                }
                n = n.nextSibling;
            }
            return ret;
        },
        '~': function(node, tag) {
            var n = node.nextSibling, results = [];
            while (n) {
                if (n.tagName == tag) {
                    results.push(n);
                }
                n = n.nextSibling;
            }
            return results;
        }
    };

    function combine(selector, contexts, combinator) {
        var i, j, n, ret = [], results = [],
        conLen = contexts.length,
        filters = selector.filters,
        filLen = filters.length;
        for (j = 0; j < conLen; j++) {
            combinator == '' && (combinator = ' ');
            if (filLen && filters[0].type == 'id' && contexts[j] == document) {
                n = document.getElementById(filters[0].match[1]);
                if (!n || (selector.tag != '*' && n.tagName != selector.tag)) {
                    ret = [];
                }
                else {
                    ret = [n];
                }
                i = 1;
            }
            else {
                ret = combinators[combinator](contexts[j], selector.tag);
                i = 0;
            }
            if (ret.length == 0) {
                continue;
            }
            if (filLen) {
                for (; i < filLen; i++) {
                    ret = filter(ret, filters[i]);
                }
            }
            else {
                //ret = nodesToArray(ret);
            }
            results = results.concat(ret);
        }
        return results;
    }

    function querySubSelectors(s, contexts, firstOnly) {
        var single = null, ret = contexts, combinator = '';
        do {
            single = parseSingle(s);
            if (single) {
                s = single[2];
                ret = combine(single[0], ret, combinator);
                combinator = single[1];
            }
            else {
                s = '';
                break;
            }
        }
        while (single[1] != ',' && s.length > 0);
        return [ret, s];
    }

    function query(s, contexts, firstOnly, prefix) {
        var ret = null, results = [], prefix = prefix || '';
        while (s.length > 0) {
            ret = querySubSelectors(prefix + s, contexts, firstOnly);
            //console.log(prefix + s);
            s = ret[1];
            results = results.concat(ret[0]);
        }
        //console.log(results);
        return results;
    }

    return query(selector, [context], firstOnly);
};