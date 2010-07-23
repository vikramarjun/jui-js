/*
* Author:
*   xushengs@gmail.com
*   http://fdream.net/
* */
(function($) {
    var Selector = (function() {
        var //uid = 1,            // global uid of nodes
        current = {},       // current found
        support = {},       // features detection
        parsedCache = {},   // cache parsed selectors
        attributeAlias = {  // attribute names
            'class': 'className'
        },
        
        nthRE = /^(?:(?:([-]?\d*)(n{1}))?([-+]?\d*)|(odd|even))$/, // supports an+b, b, an, odd, even
        re = /((?:[_a-zA-Z][\w-]*)|\*)|(?:#([\w-]+))|(?:\.([\w-]+))|(?:\[([a-z]+\w*)+([~\|\^\$\*!]?=)?['"]?([^\]]*?)["']?\])|(?::([\-\w]+)(?:\(['"]?(.+?)["']?\))*)|(?:\s*((?:[>+~\s,])|$)\s*)/g;


        // check features
        (function() {
            // Our guinea pig
            var testee = document.createElement('div'), id = (new Date()).getTime();
            testee.innerHTML = '<a name="' + id + '" class="€ b"></a>';

            // Safari can't handle uppercase or unicode characters when in quirks mode.
            support.qsa = !!(testee.querySelectorAll && testee.querySelectorAll('.€').length);
        })();

        // locate current found
        function locateCurrent(node) {
            var uid = $.getUid(node);
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

        // create a parsed selector
        function create(combinator) {
            return {
                combinator: combinator || ' ',
                tag: '*',
                id: null,
                classes: [],
                attributes: []
            }
        }

        // parse a selector
        function parse(s) {
            if (parsedCache[s]) {
                return parsedCache[s];
            }

            var selectors = [], sentence = [], parsed, match, combinator,
            sni = sli = ci = ai = pi = 0;

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
                // combinators
                else if (match[9]) {
                    sentence[sni++] = parsed;

                    if (match[9] == ',') {
                        selectors[sli++] = sentence;
                        sentence = [];
                        sni = 0;
                        combinator = null;
                    }
                    else {
                        combinator = match[9];
                    }

                    parsed = create(combinator);
                    ci = ai = pi = 0;
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
            }
        };

        // combine by id
        var combineById = {
            ' ': function(node, cxt) {
                while (node = node.parentNode) {
                    // fixed a bug of IE6 with rising installed
                    if (node == cxt || (cxt == document && node.documentElement)) {
                        return true;
                    }
                }

                return false;
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
                var n, i = 0, results = [], r = 0, pattern,
                key = attributeAlias[attr.key] || attr.key,
                flag = /^(?:src|href|action)$/.test(key) ? 2 : 0;

                if (attr.op) {
                    pattern = attributeRE[attr.op](attr.value);
                    while (n = nodes[i++]) {
                        attribute[attr.op](n[key] || n.getAttribute(key, flag), pattern) && (results[r++] = n);
                    }
                }
                else {
                    while (n = nodes[i++]) {
                        ((n[key] || n.getAttribute(key, flag)) != null) && (results[r++] = n);
                    }
                }

                return results;
            } 
        };

        // query sub selector
        function combine(selector, contexts) {
            var ret = [], klass, i = 0, item,
            locate = locateCurrent,
            // selector related
            combinator = selector.combinator,
            id = selector.id,
            tag = selector.tag,
            classes = selector.classes,
            attributes = selector.attributes;

            // if id is supplied
            if (id) {
                // match id
                var node = document.getElementById(id);

                // match tag and match combinator
                if (tag == '*' || node.tagName == tag) {
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

            if (classes.length > (i = 0)) {
                // filter nodes by class
                while (item = classes[i++]) {
                    ret = filter.klass(ret, item);
                }
            }

            if (attributes.length > (i = 0)) {
                // filter nodes by attributes
                while (item = attributes[i++]) {
                    ret = filter.attribute(ret, item);
                }
            }

            return ret;
        }

        // query a sentence
        function search(sentence, contexts) {
            var i = 0, selector;
            current = {};
            nthNodesCache = {};
            while (selector = sentence[i++]) {
                contexts = combine(selector, contexts);
            }

            return contexts;
        }

        // query a selector
        function query(selector, contexts) {
            var results = [], i = 0, sentence,
            selectors = parse(selector);

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
            var i = 0, item, key, pattern, flag;
            parsed = parsed[0][0];

            if (parsed.id && parsed.id != node.id) {
                return false;
            }

            if (parsed.classes.length > (i = 0)) {
                // filter node by class
                while (item = parsed.classes[i++]) {
                    if (!(new RegExp('(?:^|\\s+)' + escapeRegExp(item) + '(?:\\s+|$)')).test(node.className)) {
                        return false;
                    }
                }
            }

            if (parsed.attributes.length > (i = 0)) {
                // filter node by attributes
                while (item = parsed.attributes[i++]) {
                    key = attributeAlias[item.key];
                    flag = /^(?:src|href|action)$/.test(key) ? 2 : 0;
                    key = node[key] || node.getAttribute(key, flag);
                    if (item.op) {
                        if (!attribute[item.op](key, attributeRE[item.op](item.value))) {
                            return false;
                        }
                    }
                    else if (key == null) {
                        return false;
                    }
                }
            }

            return true;
        }

        // return the selector function
        return function(selector, context) {
            // TODO: handle empty string
            if (!selector || typeof selector !== "string") {
                return [];
            }

            context = context || document;

            if (context.nodeType !== 1 && context.nodeType !== 9) {
                return [];
            }
            if (support.qsa) {
                try {
                    return context.querySelectorAll(selector);
                }
                catch (e) {
                    return query(selector, [context]);
                }
            }
            else {
                return query(selector, [context]);
            }
        }
    })();

    $.Selector = Selector;
})(JUI);