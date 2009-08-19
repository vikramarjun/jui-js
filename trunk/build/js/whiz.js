var whiz = (function() {
    var uid = 1,    // global uid of nodes
        current = {},   // current found
        support = {},   // features detection
        parsedCache = {}, // parsed selectors

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
                while ((array[i] = list[i++])) { }
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
                    parsed.last = true;
                    selectors[sli++] = sentence;
                    sentence = [];
                    sni = 0;
                    combinator = null;
                }
                else {
                    combinator = match[9];
                }

                // end of a sub-selector
                parsed = create(combinator);
                ci = 0;
                ai = 0;
                pi = 0;
            }
            else {
                break;
            }
        }

        parsed.last = true;
        sentence[sni++] = parsed;
        selectors[sli++] = sentence;

        return selectors;
    }

    // combine by tag
    var combineByTag = {
        ' ': function(tag, ctx, ret, locate) {
            var nodes, n, i = 0, len = ret.length;
            nodes = ctx.getElementsByTagName(tag);
            while (n = nodes[i++]) {
                n.nodeType == 1 && locate(n) && (ret[len++] = n);
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

    // query sub selector
    function combine(selector, contexts, results) {
        var ret = [], klass, i,
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
            ret = document.getElementById(id);

            // match tag and match combinator
            if (tag == '*' || ret.tagName == tag) {
                i = 0;
                while (cxt = contexts[i++]) {
                    if (combineById[combinator](ret, cxt)) {
                        ret = [ret];
                        break;
                    }
                }
            }

            ret = [];
        }
        else if (tag != '*') {
            i = 0;
            current = {};
            if (contexts.length == 1) {
                locate = locateFast;
            }
            while (cxt = contexts[i++]) {
                ret = combineByTag[combinator](tag, cxt, ret, locate);
            }
        }

        return ret;
    }

    // query a sentence
    function search(sentence, contexts, results) {
        var i = 0, selector, lastResults = [];
        while (selector = sentence[i++]) {
            if (selector.last) {
                lastResults = results;
            }
            contexts = combine(selector, contexts, lastResults);
        }

        return contexts;
    }

    // query a selector
    function query(selector, contexts) {
        var results = [], i = 0, selectors, sentence;

        selectors = parse(selector);
        //console.log(selectors);

        while (sentence = selectors[i++]) {
            results = search(sentence, contexts, results);
        }

        return results;
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