var whiz = (function() {
    var uid = 1,    // global uid of nodes
        current = {},   // current found
        support = {},   // features detection
        parsedCache = {}, // parsed selectors,
        attributeAlias = {
            'class': 'className',
            'html': 'innerHTML',
            'for': 'htmlFor'
        },

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
        nthRE = /^(?:(?:([-]?\d*)(n{1}))?([-+]?\d*)|(odd|even))$/, // supports an+b, b, an, odd, even
        re = /((?:[_a-zA-Z][\w-]*)|\*)|(?:#([\w-]+))|(?:\.([\w-]+))|(?:\[([a-z]+\w*)+([~\|\^\$\*!]?=)?['"]?([^\]]*?)["']?\])|(?::([\-\w]+)(?:\(['"]?(.+?)["']?\))*)|(?:\s*((?:[>+~\s,])|$)\s*)/g;


    // Checks similar to NWMatcher, Sizzle
    (function() {
        // Our guinea pig
        var testee = document.createElement('div'), id = (new Date()).getTime();
        testee.innerHTML = '<a name="' + id + '" class="€ b"></a>';
        testee.appendChild(document.createComment(''));

        // IE returns comment nodes for getElementsByTagName('*')
        support.comment = (testee.getElementsByTagName('*').length > 1);

        // Safari can't handle uppercase or unicode characters when in quirks mode.
        support.qsa = !!(testee.querySelectorAll && testee.querySelectorAll('.€').length);

        support.getByClass = (function() {
            if (!testee.getElementsByClassName || !testee.getElementsByClassName('b').length) return false;
            testee.firstChild.className = 'c';
            return (testee.getElementsByClassName('c').length == 1);
        })();

        var root = document.documentElement;
        root.insertBefore(testee, root.firstChild);

        // IE returns named nodes for getElementById(name)
        support.nameAsId = !!(document.getElementById(id));

        root.removeChild(testee);

    })();

    // get unique id
    var getUid = (window.ActiveXObject) ? function(node) {
        return (node.$whizUid || (node.$whizUid = [uid++]))[0];
    } : function(node) {
        return node.$whizUid || (node.$whizUid = uid++);
    };

    // locate current found
    function locateCurrent(node) {
        var uid = getUid(node);
        return (current[uid]) ? null : (current[uid] = true);
    };

    // locate fast
    function locateFast(node) {
        return true;
    }

    // escape regular expressions
    function escapeRegExp(text) {
        return text.replace(/[-.*+?^${}()|[\]\/\\]/g, '\\$&');
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
                while ((array[i] = nodes[i++])) { }
                array.length--;
                return array;
            }
        }

        return nodes;
    }

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

    // parse a selector
    function parse(s) {
        // if has parsed
        if (parsedCache[s]) {
            return parsedCache[s];
        }

        var selectors = [], sentence = [], parsed, match, combinator,
            sni = 0, sli = 0, ci = 0, ai = 0, pi = 0;

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
                parsed.classes[ci++] = match[3];
            }
            // attributes
            else if (match[4]) {
                parsed.attributes[ai++] = { key: match[4], op: match[5], value: match[6] };
            }
            // pseudos
            else if (match[7]) {
                parsed.pseudos[pi++] = { key: match[7], value: match[8] };
            }
            // combinators
            else if (match[9]) {
                sentence[sni++] = parsed;

                if (match[9] == ',') {
                    //parsed.last = true;
                    selectors[sli++] = sentence;
                    sentence = [];
                    sni = 0;
                    combinator = null;
                }
                else {
                    combinator = match[9];
                }

                parsed = create(combinator);
                ci = 0;
                ai = 0;
                pi = 0;
            }
            else {
                break;
            }
        }

        sentence[sni++] = parsed;
        selectors[sli++] = sentence;

        return parsedCache[s] = selectors;
    }

    // combine by tag
    var combineByTag = {
        ' ': function(tag, ctx, ret, locate) {
            var nodes, n, i = 0, len = ret.length;
            nodes = ctx.getElementsByTagName(tag);
            if (locate) {
                while (n = nodes[i++]) {
                    n.nodeType == 1 && locate(n) && (ret[len++] = n);
                }
            }
            else {
                while (n = nodes[i++]) {
                    n.nodeType == 1 && (ret[len++] = n);
                }
            }

            return ret;
        },
        '>': function(tag, ctx, ret) {
            var nodes, n, i = 0, len = ret.length;
            nodes = ctx.getElementsByTagName(tag);

            while (n = nodes[i++]) {
                n.parentNode == ctx && (ret[len++] = n);
            }

            return ret;
        },
        '+': function(tag, ctx, ret, locate) {
            var len = ret.length;
            while (ctx = ctx.nextSibling) {
                if (ctx.nodeType == 1) {
                    ctx.tagName == tag && locate(ctx) && (ret[len++] = ctx);
                    break;
                }
            }

            return ret;
        },
        '~': function(tag, ctx, ret, locate) {
            var len = ret.length;
            while (ctx = ctx.nextSibling) {
                if (ctx.nodeType == 1) {
                    if (!locate(ctx)) {
                        break;
                    }
                    ctx.tagName == tag && (ret[len++] = ctx);
                }
            }

            return ret;
        }
    };

    // combine by id
    var combineById = {
        ' ': function(node, cxt) {
            while (node = node.parentNode) {
                if (node == cxt) {
                    return true;
                }
            }

            return false;
        },

        '>': function(node, cxt) {
            return node.parentNode == cxt;
        },

        '+': function(node, cxt) {
            var n = node, ret = false;
            while (n = n.previousSibling) {
                if (n != cxt && n.tagName == node.tagName) {
                    return false;
                }
                if (n == cxt) {
                    return true;
                }
            }
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
        'contains': function(node, re) {
            return re.test(node.innerText || node.textContent || '');
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

    // filters
    var filter = {
        klass: function(nodes, name) {
            var n, i = 0, results = [], r = 0, pattern;

            pattern = new RegExp('(?:^|\\s+)' + escapeRegExp(name) + '(?:\\s+|$)');

            while (n = nodes[i++]) {
                pattern.test(n.className) && (results[r++] = n);
            }
            return results;
        },

        attribute: function(nodes, attr) {
            var n, i = 0, results = [], r = 0, pattern, key = attributeAlias[attr.key] || attr.key;
            if (attr.op) {
                pattern = attributeRE[attr.op](attr.value);
                while (n = nodes[i++]) {
                    attribute[attr.op](n[key] || n.getAttribute(key), pattern) && (results[r++] = n);
                }
            }
            else {
                while (n = nodes[i++]) {
                    (n[key] != null || n.getAttribute(key) != null) && (results[r++] = n);
                }
            }

            return results;
        },

        pseudo: function(nodes, pdo) {
            var parsed = pdo.value, n, i = 0, results = [];

            //if (/^nth-/.test(pdo.key)) {
            //    parsed = parseNth(pdo.value);
            //}
            switch (pdo.key.charAt(2)) {
                case 't': // not
                    parsed = parse(pdo.value);
                    break;
                case 'n': // contains
                    parsed = new RegExp(escapeRegExp(pdo.value));
                    break;
                case 'h': // nth
                    parsed = parseNth(pdo.value);
                    break;
            }

            while (n = nodes[i++]) {
                pseudo[pdo.key](n, parsed) && results.push(n);
            }

            return results;
        }
    };

    // query sub selector
    function combine(selector, contexts) {
        var ret = [], klass, i, item,
            locate = locateCurrent,
        // selector related
            combinator = selector.combinator,
            id = selector.id,
            tag = selector.tag,
            classes = selector.classes,
            attributes = selector.attributes,
            pseudos = selector.pseudos;

        // if id is supplied
        if (id) {
            // match id
            var node = document.getElementById(id);

            // match tag and match combinator
            if (tag == '*' || node.tagName == tag) {
                i = 0;
                while (cxt = contexts[i++]) {
                    if (combineById[combinator](node, cxt)) {
                        ret = [node];
                        break;
                    }
                }
            }
        }
        else if (tag) {
            i = 0;
            current = {};
            if (contexts.length == 1) {
                locate = false;
            }
            while (cxt = contexts[i++]) {
                ret = combineByTag[combinator](tag, cxt, ret, locate);
            }
        }

        if (classes.length > 0) {
            // filter nodes by class
            i = 0;
            while (item = classes[i++]) {
                ret = filter.klass(ret, item);
            }
        }

        if (attributes.length > 0) {
            // filter nodes by attributes
            i = 0;
            while (item = attributes[i++]) {
                ret = filter.attribute(ret, item);
            }
        }

        if (pseudos.length > 0) {
            // filter nodes by pseudos
            i = 0;
            while (item = pseudos[i++]) {
                ret = filter.pseudo(ret, item);
            }
        }

        return ret;
    }

    // query a sentence
    function search(sentence, contexts) {
        var i = 0, selector;
        current = {};
        while (selector = sentence[i++]) {
            contexts = combine(selector, contexts);
        }

        return contexts;
    }

    // query a selector
    function query(selector, contexts) {
        var results = [], i = 0, selectors, sentence;

        selectors = parse(selector);
        //console.log(selectors);

        while (sentence = selectors[i++]) {
            if (results.length > 0) {
                results = search(sentence, contexts).concat(results);
            }
            else {
                results = search(sentence, contexts);
            }
        }

        return results;
    }

    // test a node whether match a selector
    function testNode(node, parsed) {
        var i = 0, item, key, pattern;
        parsed = parsed[0][0];

        if (parsed.id && parsed.id != node.id) {
            return false;
        }

        if (parsed.classes.length > 0) {
            // filter nodes by class
            i = 0;
            while (item = parsed.classes[i++]) {
                pattern = new RegExp('(?:^|\\s+)' + escapeRegExp(item) + '(?:\\s+|$)');

                if (!pattern.test(node.className)) {
                    return false;
                }
            }
        }

        if (parsed.attributes.length > 0) {
            // filter nodes by attributes
            i = 0;
            while (item = parsed.attributes[i++]) {
                key = attributeAlias[item.key];
                key = node[key] || node.getAttribute(key);
                if (item.op) {
                    pattern = attributeRE[item.op](item.value);
                    if (!attribute[item.op](key, pattern)) {
                        return false;
                    }
                }
                else {
                    if (key == null) {
                        return false;
                    }
                }
            }
        }

        if (parsed.pseudos.length > 0) {
            // filter nodes by pseudos
            i = 0;
            while (item = parsed.pseudos[i++]) {
                pattern = item.value;
                switch (item.key.charAt(2)) {
                    case 't': // not
                        pattern = parse(item.value);
                        break;
                    case 'n': // contains
                        pattern = new RegExp(escapeRegExp(item.value));
                        break;
                    case 'h': // nth
                        pattern = parseNth(item.value);
                        break;
                }

                if (!pseudo[item.key](node, pattern)) {
                    return false;
                }
            }
        }

        return true;
    }

    // return the selector function
    return function(selector, context) {
        //console.time('whiz');
        // TODO: handle empty string
        if (!selector || typeof selector !== "string") {
            return [];
        }

        context = context || document;

        if (context.nodeType !== 1 && context.nodeType !== 9) {
            return [];
        }
        //console.timeEnd('whiz');
        return query(selector, [context]);
    }
})();