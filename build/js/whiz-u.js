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

    firstOnly = firstOnly ? true : false;

    // features and bugs detection
    var supports = {};

    // detect IE getElementsByTagName comment nodes bug
    supports.tagComments = (function() {
        var t = context.createElement('div');
        t.appendChild(context.createComment(''));
        t = t.getElementsByTagName('*')[0];
        return !!(t && t.nodeType == 8);
    })();

    // escape regular expressions
    function escapeRegExp(text) {
        return text.replace(/[-.*+?^${}()|[\]\/\\]/g, '\\$&');
    }

    // these regular expressions are from YUI, 
    // maybe I shoud modify them to support muliti-languages
    // tag: /^((?:-?[_a-z][\w-]*)|\*)/i, // tag must be the first, or it will be *
    // id: /^#([\w-]+)/,    // id starts with #
    // class: /^\.([\w-]+)/
    // attribute: /^\[([a-z]+\w*)+([~\|\^\$\*!]?=)?['"]?([^\]]*?)['"]?\]/i,
    // pseudo: /^:([\-\w]+)(?:\(['"]?(.+?)["']?\))*/ //,
    // combinator: /^\s*((?:[>+~\s,])|$)\s*/    // comma for multi-selectors
    // nth: /^(?:(?:([-]?\d*)(n{1}))?([-+]?\d*)|(odd|even))$/, // supports an+b, b, an, odd, even

    /**
    * large regular expression, match all types
    * match list:
    *  ----------------
    *  tag:        m[1]
    *  ----------------
    *  id:         m[2]
    *  ----------------
    *  class:      m[3]
    *  ----------------
    *  attribute:  m[4]
    *  operator:   m[5]
    *  value:      m[6]
    *  ----------------
    *  pseudo:     m[7]
    *  expression: m[8]
    *  ----------------
    *  combinator: m[9]
    *  ----------------
    *  
    * */
    var nthRE = /^(?:(?:([-]?\d*)(n{1}))?([-+]?\d*)|(odd|even))$/, // supports an+b, b, an, odd, even
        re = /((?:[_a-zA-Z][\w-]*)|\*)|(?:#([\w-]+))|(?:\.([\w-]+))|(?:\[([a-z]+\w*)+([~\|\^\$\*!]?=)?['"]?([^\]]*?)["']?\])|(?::([\-\w]+)(?:\(['"]?(.+?)["']?\))*)|(?:\s*((?:[>+~\s,])|$)\s*)/g;

    // create a parsed selector
    function create(combinator) {
        return {
            combinator: combinator || ' ',
            tag: '*',
            id: null,
            classes: [],
            attributes: [],
            pseudos: []
        }
    }

    // convert nodes to array
    function nodesToArray(nodes) {
        if (!nodes.slice) {
            try {
                return Array.prototype.slice.call(nodes, start, end);
            } catch (e) { // IE: requires manual copy
                // avoid using the length property of nodeLists
                // it may have been overwritten by bad HTML code
                var i = 0, array = [];
                while ((array[i] = list[i++])) { }
                array.length--;
                return array;
            }
        }

        return nodes;
    }

    // parse a selector
    function parse(s) {
        var selectors = [], sentence = [], parsed, match, combinator;

        parsed = create();
        re.lastIndex = 0;
        while (match = re.exec(s)) {
            // tag
            if (match[1]) {
                parsed.tag = match[1].toUpperCase();
            }
            // id
            else if (match[2]) {
                parsed.id = match[2];
            }
            // classes
            else if (match[3]) {
                parsed.classes.push(match[3]);
            }
            // attributes
            else if (match[4]) {
                parsed.attributes.push({ key: match[4], op: match[5], value: match[6] });
            }
            // pseudos
            else if (match[7]) {
                parsed.pseudos.push({ key: match[7], value: match[8] });
            }
            // combinators
            else if (match[9]) {
                sentence.push(parsed);

                if (match[9] == ',') {
                    selectors.push(sentence);
                    sentence = [];
                    combinator = null;
                }
                else {
                    combinator = match[9];
                }
                parsed = create(combinator);
            }
            else {
                break;
            }
        }

        sentence.push(parsed);
        selectors.push(sentence);

        return selectors;
    }

    // locate
    var current = {};

    var getUid = (window.ActiveXObject) ? function(node) {
        return (node.$whizUid || (node.$whizUid = [whiz.uid++]))[0];
    } : function(node) {
        return node.$whizUid || (node.$whizUid = whiz.uid++);
    };

    function locateCurrent(node) {
        var uid = getUid(node);
        return (current[uid]) ? null : (current[uid] = true);
    };

    var combineTag = {
        ' ': function(tag, ctx) {
            var nodes, n, results = [], i = 0;
            nodes = ctx.getElementsByTagName(tag);
            while (n = nodes[i++]) {
                if (n.nodeType == 1 && locateCurrent(n)) {
                    results.push(n);
                }
            }

            return results;
        },
        '>': function(tag, ctx) {
            var nodes, n, results = [], i = 0;
            nodes = ctx.getElementsByTagName(tag);

            while (n = nodes[i++]) {
                if (n.parentNode == ctx) {
                    results.push(n);
                }
            }

            return results;
            /*
            var children, i, len, n, ret = [];
            children = cxt.children;
            for (var i = 0, len = children.length; i < len; i++) {
            n = children[i];
            (n.tagName == tag) && ret.push(n);
            }
            return ret;
            */
        },
        '+': function(tag, ctx) {
            var results = [];
            while (ctx = ctx.nextSibling) {
                if (ctx.nodeType == 1) {
                    if (ctx.tagName == tag && locateCurrent(ctx)) {
                        results = [ctx];
                    }
                    break;
                }
            }

            return results;
        },
        '~': function(tag, ctx) {
            var results = [];
            while (ctx = ctx.nextSibling) {
                if (ctx.nodeType == 1 && ctx.tagName == tag && locateCurrent(ctx)) {
                    results.push(ctx);
                }
            }

            return results;
        }
    };

    var combineId = {
        ' ': function(node, cxt) {
            var ret = false;
            while (node = node.parentNode) {
                if (node == cxt) {
                    ret = true;
                    break;
                }
            }

            return ret;
        },

        '>': function(node, cxt) {
            return node.parentNode == cxt;
        },

        '+': function(node, cxt) {
            var n = node, ret = false;
            while (n = n.previousSibling) {
                if (n.tagName == node.tagName) {
                    ret = false;
                    break;
                }
                if (n == cxt) {
                    ret = true;
                    break;
                }
            }

            return ret;
        },

        '~': function(node, cxt) {
            var ret = false;
            while (n = n.previousSibling) {
                if (n == cxt) {
                    ret = true;
                    break;
                }
            }

            return ret;
        }
    };

    var attributeRE = {
        '=': function(val) {
            return val;
        },
        '~=': function(val) {
            return new RegExp('(?:^|\\s+)' + escapeRegExp(val) + '(?:\\s+|$)');
        },
        '!=': function(val) {
            return val;
        },
        '^=': function(val) {
            return new RegExp('^' + escapeRegExp(val));
        },
        '$=': function(val) {
            return new RegExp(escapeRegExp(val) + '$');
        },
        '*=': function(val) {
            return new RegExp(escapeRegExp(val));
        },
        '|=': function(val) {
            return new RegExp('^' + escapeRegExp(val) + '-?');
        }
    };

    // attribute filters
    var attribute = {
        '=': function(attr, val) {
            // value is equal to val
            return attr == val;
        },
        '~=': function(attr, val) {
            // value is seperated by space, one of them is equal to val
            return val.test(attr);
        },
        '!=': function(attr, val) {
            // value is not equal to val
            return attr != val;
        },
        '^=': function(attr, val) {
            // value is started with val
            return val.test(attr);
        },
        '$=': function(attr, val) {
            // value is ended with val
            return val.test(attr);
        },
        '*=': function(attr, val) {
            // value contains val(string)
            return val.test(attr);
        },
        '|=': function(attr, val) {
            // value is seperated by hyphen, one of them is started with val
            // optional hyphen-delimited
            return val.test(attr);
        }
    };

    // cache parsed nth expression
    var nthCache = {}, nthNodesCache = {};

    // parse nth expression
    function parseNth(expr) {
        if (nthCache[expr]) {
            return nthCache[expr];
        }

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

        return (nthCache[expr] = { a: a, b: b });
    }

    // judge if matches with the nth expression
    function getNth(node, parsed, reverse) {
        var a, b, siblings, ret = false, i, len;

        a = parsed.a;
        b = parsed.b;

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

    var pseudo = {
        'root': function(node) {
            return node === node.ownerDocument.documentElement;
        },
        'nth-child': function(node, parsed) {
            var uid, puid, pos, cachem, count = 1;

            uid = getUid(node);
            puid = getUid(node.parentNode);

            cache = nthNodesCache[puid] || (nthNodesCache[puid] = {});

            if (!cache[uid]) {
                while ((node = node.previousSibling)) {
                    if (node.nodeType != 1) continue;
                    count++;
                    pos = cache[getUid(node)];

                    if (pos) {
                        count = pos + count - 1;
                        break;
                    }
                }
                cache[uid] = count;
            }

            return (cache[uid] % parsed.a == parsed.b);
        },
        'nth-last-child': function(node, parsed) {
            return;
        },
        'nth-of-type': function(node, parsed) {
            return;
        },
        'nth-last-of-type': function(node, parsed) {
            return;
        },
        'first-child': function(node) {
            var sibling = node.parentNode.firstChild;
            while (sibling.nodeType != 1) {
                sibling = sibling.nextSibling;
            }
            return node === sibling;
        },
        'last-child': function(node) {
            while ((node = node.nextSibling)) {
                if (node.nodeType === 1) return false;
            }
            return true;
        },
        'first-of-type': function(node) {
            var sibling = node.parentNode.firstChild, tagName = node.tagName;
            while (sibling.nodeType != 1 && sibling.tagName != tagName) {
                sibling = sibling.nextSibling;
            }
            return node === sibling;
        },
        'last-of-type': function(node) {
            var tagName = node.tagName;
            while ((node = node.nextSibling)) {
                if (node.nodeType === 1 && node.tagName == tagName) return false;
            }
            return true;
        },
        'only-child': function(node) {
            var prev = node;
            while ((prev = prev.previousSibling)) {
                if (prev.nodeType === 1) return false;
            }
            var next = node;
            while ((next = next.nextSibling)) {
                if (next.nodeType === 1) return false;
            }
            return true;
        },
        'only-of-type': function(node) {
            var prev = node, tagName = node.tagName;
            while ((prev = prev.previousSibling)) {
                if (prev.nodeType === 1 && node.tagName == tagName) return false;
            }
            var next = node;
            while ((next = next.nextSibling)) {
                if (next.nodeType === 1 && node.tagName == tagName) return false;
            }
            return true;
        },
        'empty': function(node) {
            return !node.firstChild;
        },
        'parent': function(node) {
            return !!node.firstChild;
        },
        'link': function() {
            return;
        },
        'visited': function() {
            return;
        },
        'active': function() {
            return;
        },
        'hover': function() {
            return;
        },
        'focus': function() {
            return;
        },
        'target': function() {
            return;
        },
        'lang': function() {
            return;
        },
        'enabled': function() {
            return node.disabled === false && node.type !== "hidden";
        },
        'disabled': function() {
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
        'visible': function(node) {
            return node.offsetWidth > 0 || node.offsetHeight > 0;
        },
        'hidden': function(node) {
            return node.offsetWidth === 0 || node.offsetHeight === 0;
        },
        'first-line': function() {
            return;
        },
        'first-letter': function() {
            return;
        },
        'before': function() {
            return;
        },
        'after': function() {
            return;
        },
        'not': function(node, value) {
            return !testNode(node, value);
        },
        'contains': function(node) {
            return (node.innerText || node.textContent || '').indexOf(val) != -1;
        },
        'nth': function(node, value) {
            return;
        },
        'odd': function(node) {
            return;
        },
        'even': function(node) {
            return;
        }
    };
    pseudo.index = pseudo.nth;

    var filter = {
        klass: function(nodes, name) {
            var n, i = 0, results = [], pattern;

            pattern = new RegExp('(?:^|\\s+)' + escapeRegExp(name) + '(?:\\s+|$)');

            while (n = nodes[i++]) {
                pattern.test(n.className) && results.push(n);
            }
            return results;
        },

        attribute: function(nodes, attr) {
            var n, i = 0, results = [], pattern;
            if (attr.op) {
                pattern = attributeRE[attr.op](attr.value);
                while (n = nodes[i++]) {
                    attribute[attr.op](n.getAttribute(attr.key), pattern) && results.push(n);
                }
            }
            else {
                while (n = nodes[i++]) {
                    n.getAttribute(attr.key) != null && results.push(n);
                }
            }

            return results;
        },

        pseudo: function(nodes, pdo) {
            var parsed, n, i = 0, results = [];

            pdo.value && (parsed = parseNth(pdo.value));

            while (n = nodes[i++]) {
                pseudo[pdo.key](n, parsed) && results.push(n);
            }

            return results;
        }
    };

    // combine
    function combine(parsed, cxts) {
        var i, n, cxt, combinator, tag, id, classes, attributes, pseudos, item, ret = [];

        combinator = parsed.combinator;
        tag = parsed.tag;
        id = parsed.id;
        classes = parsed.classes;
        attributes = parsed.attributes;
        pseudos = parsed.pseudos;

        current = {}, nthChildCache = {};

        // find nodes by id or tag
        if (id) {
            n = document.getElementById(id);
            if (tag == '*' || n.tagName == tag) {
                i = 0;
                while (cxt = cxts[i++]) {
                    if (combineId[combinator](n, cxt)) {
                        ret = [n];
                        break;
                    }
                }
            }

            ret = [];
        }
        else {
            i = 0;
            while (cxt = cxts[i++]) {
                ret = ret.concat(combineTag[combinator](tag, cxt));
            }
        }

        // filter nodes by class
        i = 0;
        while (item = classes[i++]) {
            ret = filter.klass(ret, item);
        }

        // filter nodes by attributes
        i = 0;
        while (item = attributes[i++]) {
            ret = filter.attribute(ret, item);
        }

        // filter nodes by pseudos
        i = 0;
        while (item = pseudos[i++]) {
            ret = filter.pseudo(ret, item);
        }

        return ret;
    }

    // test a node whether match a selector
    function testNode(node, value) {
        return false;
    }

    // search a sentential selector
    function search(s, cxts) {
        var i = 0, sl;
        while (sl = s[i++]) {
            cxts = combine(sl, cxts);
        }

        return cxts;
    }

    // query
    function query(qs, cxts) {
        //console.time('q');
        var selectors, i = 0, sl, results = [], ret = [];
        selectors = parse(qs);
        while (sl = selectors[i++]) {
            results = search(sl, cxts).concat(results);
        }
        //console.timeEnd('q');
        return results;
    }

    // start query
    return query(selector, [context]);
}

whiz.uid = 1;