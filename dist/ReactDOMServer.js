(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('stream')) :
    typeof define === 'function' && define.amd ? define(['exports', 'stream'], factory) :
    (factory((global.ReactDOMServer = {}),global.stream));
}(this, (function (exports,stream) {
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var hasSymbol = typeof Symbol === 'function' && Symbol['for'];
    var emptyObject = {};
    var REACT_ELEMENT_TYPE = hasSymbol ? Symbol['for']('react.element') : 0xeac7;
    function noop() {}
    function returnFalse() {
        return false;
    }
    function returnTrue() {
        return true;
    }
    function get(key) {
        return key._reactInternalFiber;
    }
    var __type = Object.prototype.toString;
    var fakeWindow = {};
    function getWindow() {
        try {
            if (window) {
                return window;
            }
        } catch (e) {        }
        try {
            if (global) {
                return global;
            }
        } catch (e) {        }
        return fakeWindow;
    }
    function toWarnDev(msg, deprecated) {
        msg = deprecated ? msg + ' is deprecated' : msg;
        var process = getWindow().process;
        if (process && process.env.NODE_ENV === 'development') {
            throw msg;
        }
    }
    function extend(obj, props) {
        for (var i in props) {
            if (hasOwnProperty.call(props, i)) {
                obj[i] = props[i];
            }
        }
        return obj;
    }
    function inherit(SubClass, SupClass) {
        function Bridge() {}
        var orig = SubClass.prototype;
        Bridge.prototype = SupClass.prototype;
        var fn = SubClass.prototype = new Bridge();
        extend(fn, orig);
        fn.constructor = SubClass;
        return fn;
    }
    try {
        var supportEval = Function('a', 'return a + 1')(2) == 3;
    } catch (e) {}
    var rname = /function\s+(\w+)/;
    function miniCreateClass(ctor, superClass, methods, statics) {
        var className = ctor.name || (ctor.toString().match(rname) || ['', 'Anonymous'])[1];
        var Ctor = supportEval ? Function('superClass', 'ctor', 'return function ' + className + ' (props, context) {\n            superClass.apply(this, arguments); \n            ctor.apply(this, arguments);\n      }')(superClass, ctor) : function ReactInstance() {
            superClass.apply(this, arguments);
            ctor.apply(this, arguments);
        };
        Ctor.displayName = className;
        var proto = inherit(Ctor, superClass);
        extend(proto, methods);
        extend(Ctor, superClass);
        if (statics) {
            extend(Ctor, statics);
        }
        return Ctor;
    }
    function isFn(obj) {
        return __type.call(obj) === '[object Function]';
    }
    var rword = /[^, ]+/g;
    function oneObject(array, val) {
        if (array + '' === array) {
            array = array.match(rword) || [];
        }
        var result = {},
        value = val !== void 666 ? val : 1;
        for (var i = 0, n = array.length; i < n; i++) {
            result[array[i]] = value;
        }
        return result;
    }
    var numberMap = {
        '[object Boolean]': 2,
        '[object Number]': 3,
        '[object String]': 4,
        '[object Function]': 5,
        '[object Symbol]': 6,
        '[object Array]': 7
    };
    function typeNumber(data) {
        if (data === null) {
            return 1;
        }
        if (data === void 666) {
            return 0;
        }
        var a = numberMap[__type.call(data)];
        return a || 8;
    }

    var fakeObject = {
        enqueueSetState: returnFalse,
        isMounted: returnFalse
    };
    function Component(props, context) {
        this.context = context;
        this.props = props;
        this.refs = {};
        this.updater = fakeObject;
        this.state = null;
    }
    Component.prototype = {
        constructor: Component,
        replaceState: function replaceState() {
            toWarnDev("replaceState", true);
        },
        isReactComponent: returnTrue,
        isMounted: function isMounted$$1() {
            toWarnDev("isMounted", true);
            return this.updater.isMounted(this);
        },
        setState: function setState(state, cb) {
            this.updater.enqueueSetState(get(this), state, cb);
        },
        forceUpdate: function forceUpdate(cb) {
            this.updater.enqueueSetState(get(this), true, cb);
        },
        render: function render() {
            throw "must implement render";
        }
    };

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
    function isValidElement(vnode) {
        return !!vnode && vnode.$$typeof === REACT_ELEMENT_TYPE;
    }
    function escape(key) {
        var escapeRegex = /[=:]/g;
        var escaperLookup = {
            '=': '=0',
            ':': '=2'
        };
        var escapedString = ('' + key).replace(escapeRegex, function (match) {
            return escaperLookup[match];
        });
        return '$' + escapedString;
    }
    function getComponentKey(component, index) {
        if ((typeof component === 'undefined' ? 'undefined' : _typeof(component)) === 'object' && component !== null && component.key != null) {
            return escape(component.key);
        }
        return index.toString(36);
    }
    var SEPARATOR = '.';
    var SUBSEPARATOR = ':';
    function traverseAllChildren(children, nameSoFar, callback, bookKeeping) {
        var childType = typeNumber(children);
        var invokeCallback = false;
        switch (childType) {
            case 0:
            case 1:
            case 2:
            case 5:
            case 6:
                children = null;
                invokeCallback = true;
                break;
            case 3:
            case 4:
                invokeCallback = true;
                break;
            case 8:
                if (children.$$typeof || children instanceof Component) {
                    invokeCallback = true;
                } else if (children.hasOwnProperty('toString')) {
                    children = children + '';
                    invokeCallback = true;
                    childType = 3;
                }
                break;
        }
        if (invokeCallback) {
            callback(bookKeeping, children,
            nameSoFar === '' ? SEPARATOR + getComponentKey(children, 0) : nameSoFar, childType);
            return 1;
        }
        var subtreeCount = 0;
        var nextNamePrefix = nameSoFar === '' ? SEPARATOR : nameSoFar + SUBSEPARATOR;
        if (children.forEach) {
            children.forEach(function (child, i) {
                var nextName = nextNamePrefix + getComponentKey(child, i);
                subtreeCount += traverseAllChildren(child, nextName, callback, bookKeeping);
            });
            return subtreeCount;
        }
        var iteratorFn = getIteractor(children);
        if (iteratorFn) {
            var iterator = iteratorFn.call(children),
                child = void 0,
                ii = 0,
                step = void 0,
                nextName = void 0;
            while (!(step = iterator.next()).done) {
                child = step.value;
                nextName = nextNamePrefix + getComponentKey(child, ii++);
                subtreeCount += traverseAllChildren(child, nextName, callback, bookKeeping);
            }
            return subtreeCount;
        }
        throw 'children: type is invalid.';
    }
    var REAL_SYMBOL = hasSymbol && Symbol.iterator;
    var FAKE_SYMBOL = '@@iterator';
    function getIteractor(a) {
        var iteratorFn = REAL_SYMBOL && a[REAL_SYMBOL] || a[FAKE_SYMBOL];
        if (iteratorFn && iteratorFn.call) {
            return iteratorFn;
        }
    }

    var Children = {
        only: function only(children) {
            if (isValidElement(children)) {
                return children;
            }
            throw new Error("expect only one child");
        },
        count: function count(children) {
            if (children == null) {
                return 0;
            }
            return traverseAllChildren(children, "", noop);
        },
        map: function map(children, func, context) {
            return proxyIt(children, func, [], context);
        },
        forEach: function forEach(children, func, context) {
            return proxyIt(children, func, null, context);
        },
        toArray: function toArray$$1(children) {
            return proxyIt(children, K, []);
        }
    };
    function proxyIt(children, func, result, context) {
        if (children == null) {
            return [];
        }
        mapChildren(children, null, func, result, context);
        return result;
    }
    function K(el) {
        return el;
    }
    function mapChildren(children, prefix, func, result, context) {
        var keyPrefix = "";
        if (prefix != null) {
            keyPrefix = escapeUserProvidedKey(prefix) + "/";
        }
        traverseAllChildren(children, "", traverseCallback, {
            context: context,
            keyPrefix: keyPrefix,
            func: func,
            result: result,
            count: 0
        });
    }
    var userProvidedKeyEscapeRegex = /\/+/g;
    function escapeUserProvidedKey(text) {
        return ("" + text).replace(userProvidedKeyEscapeRegex, "$&/");
    }
    function traverseCallback(bookKeeping, child, childKey) {
        var result = bookKeeping.result,
            keyPrefix = bookKeeping.keyPrefix,
            func = bookKeeping.func,
            context = bookKeeping.context;
        var mappedChild = func.call(context, child, bookKeeping.count++);
        if (!result) {
            return;
        }
        if (Array.isArray(mappedChild)) {
            mapChildren(mappedChild, childKey, K, result);
        } else if (mappedChild != null) {
            if (isValidElement(mappedChild)) {
                mappedChild = extend({}, mappedChild);
                mappedChild.key = keyPrefix + (mappedChild.key && (!child || child.key !== mappedChild.key) ? escapeUserProvidedKey(mappedChild.key) + "/" : "") + childKey;
            }
            result.push(mappedChild);
        }
    }

    var isUnitlessNumber = {
        animationIterationCount: true,
        borderImageOutset: true,
        borderImageSlice: true,
        borderImageWidth: true,
        boxFlex: true,
        boxFlexGroup: true,
        boxOrdinalGroup: true,
        columnCount: true,
        columns: true,
        flex: true,
        flexGrow: true,
        flexPositive: true,
        flexShrink: true,
        flexNegative: true,
        flexOrder: true,
        gridRow: true,
        gridRowEnd: true,
        gridRowSpan: true,
        gridRowStart: true,
        gridColumn: true,
        gridColumnEnd: true,
        gridColumnSpan: true,
        gridColumnStart: true,
        fontWeight: true,
        lineClamp: true,
        lineHeight: true,
        opacity: true,
        order: true,
        orphans: true,
        tabSize: true,
        widows: true,
        zIndex: true,
        zoom: true,
        fillOpacity: true,
        floodOpacity: true,
        stopOpacity: true,
        strokeDasharray: true,
        strokeDashoffset: true,
        strokeMiterlimit: true,
        strokeOpacity: true,
        strokeWidth: true
    };
    function prefixKey(prefix, key) {
        return prefix + key.charAt(0).toUpperCase() + key.substring(1);
    }
    var prefixes = ['Webkit', 'ms', 'Moz', 'O'];
    Object.keys(isUnitlessNumber).forEach(function (prop) {
        prefixes.forEach(function (prefix) {
            isUnitlessNumber[prefixKey(prefix, prop)] = isUnitlessNumber[prop];
        });
    });
    function dangerousStyleValue(name, value, isCustomProperty) {
        var isEmpty = value == null || typeof value === 'boolean' || value === '';
        if (isEmpty) {
            return '';
        }
        if (!isCustomProperty && typeof value === 'number' && value !== 0 && !(isUnitlessNumber.hasOwnProperty(name) && isUnitlessNumber[name])) {
            return value + 'px';
        }
        return ('' + value).trim();
    }
    var uppercasePattern = /([A-Z])/g;
    var msPattern = /^ms-/;
    function hyphenateStyleName(name) {
        return name.replace(uppercasePattern, '-$1').toLowerCase().replace(msPattern, '-ms-');
    }
    var styleNameCache = {};
    var processStyleName = function processStyleName(styleName) {
        if (styleNameCache.hasOwnProperty(styleName)) {
            return styleNameCache[styleName];
        }
        var result = hyphenateStyleName(styleName);
        styleNameCache[styleName] = result;
        return result;
    };
    function createMarkupForStyles(styles) {
        var serialized = '';
        var delimiter = '';
        for (var styleName in styles) {
            if (!styles.hasOwnProperty(styleName)) {
                continue;
            }
            var isCustomProperty = styleName.indexOf('--') === 0;
            var styleValue = styles[styleName];
            if (styleValue != null) {
                serialized += delimiter + processStyleName(styleName) + ':';
                serialized += dangerousStyleValue(styleName, styleValue, isCustomProperty);
                delimiter = ';';
            }
        }
        return serialized || null;
    }

    var matchHtmlRegExp = /["'&<>]/;
    function escapeHtml(string) {
        var str = '' + string;
        var match = matchHtmlRegExp.exec(str);
        if (!match) {
            return str;
        }
        var escape;
        var html = '';
        var index = 0;
        var lastIndex = 0;
        for (index = match.index; index < str.length; index++) {
            switch (str.charCodeAt(index)) {
                case 34:
                    escape = '&quot;';
                    break;
                case 38:
                    escape = '&amp;';
                    break;
                case 39:
                    escape = '&#x27;';
                    break;
                case 60:
                    escape = '&lt;';
                    break;
                case 62:
                    escape = '&gt;';
                    break;
                default:
                    continue;
            }
            if (lastIndex !== index) {
                html += str.substring(lastIndex, index);
            }
            lastIndex = index + 1;
            html += escape;
        }
        return lastIndex !== index ? html + str.substring(lastIndex, index) : html;
    }
    function encodeEntities(text) {
        if (typeof text === 'boolean' || typeof text === 'number') {
            return '' + text;
        }
        return escapeHtml(text);
    }

    var _typeof$1 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
    var STYLE = 'style';
    var RESERVED_PROPS$1 = {
        children: null,
        key: null,
        ref: null,
        dangerouslySetInnerHTML: null,
        innerHTML: null
    };
    function skipFalseAndFunction(a) {
        return a !== false && Object(a) !== a;
    }
    var rXlink = /^xlink:?(.+)/;
    var attrCached = {};
    function encodeAttributes(value) {
        if (attrCached[value]) {
            return attrCached[value];
        }
        return attrCached[value] = '"' + encodeEntities(value) + '"';
    }
    function stringifyClassName(obj) {
        var arr = [];
        for (var i in obj) {
            if (obj[i]) {
                arr.push(i);
            }
        }
        return arr.join(' ');
    }
    function createOpenTagMarkup(tagVerbatim, tagLowercase, props, namespace, makeStaticMarkup, isRootElement) {
        var ret = '<' + tagVerbatim;
        for (var name in props) {
            if (!props.hasOwnProperty(name)) {
                continue;
            }
            if (RESERVED_PROPS$1[name]) {
                continue;
            }
            var v = props[name],
                checkType = false;
            if (name === 'class' || name === 'className') {
                name = 'class';
                if (v && (typeof v === 'undefined' ? 'undefined' : _typeof$1(v)) === 'object') {
                    v = stringifyClassName(v);
                    checkType = true;
                }
            } else if (name === STYLE) {
                v = createMarkupForStyles(v);
                checkType = true;
            }
            if (name.match(rXlink)) {
                name = name.toLowerCase().replace(rXlink, 'xlink:$1');
            }
            if (checkType || skipFalseAndFunction(v)) {
                ret += ' ' + name + '=' + encodeAttributes(v + '');
            }
        }
        if (makeStaticMarkup) {
            return ret;
        }
        if (isRootElement) {
            ret += ' ' + createMarkupForRoot();
        }
        return ret;
    }
    var ROOT_ATTRIBUTE_NAME = 'data-reactroot';
    function createMarkupForRoot() {
        return ROOT_ATTRIBUTE_NAME + '=""';
    }

    function flattenOptionChildren(children) {
        var content = '';
        Children.forEach(children, function (child) {
            if (child == null) {
                return;
            }
            if (typeof child === 'string' || typeof child === 'number') {
                content += child;
            }
        });
        return content;
    }
    var duplexMap = {
        input: function input(props, inst) {
            return Object.assign({
                type: undefined
            }, props, {
                defaultChecked: undefined,
                defaultValue: undefined,
                value: props.value != null ? props.value : props.defaultValue,
                checked: props.checked != null ? props.checked : props.defaultChecked
            });
        },
        textarea: function textarea(props, inst) {
            var initialValue = props.value;
            if (initialValue == null) {
                var defaultValue = props.defaultValue;
                var textareaChildren = props.children;
                if (textareaChildren != null) {
                    if (Array.isArray(textareaChildren)) {
                        textareaChildren = textareaChildren[0];
                    }
                    defaultValue = '' + textareaChildren;
                }
                if (defaultValue == null) {
                    defaultValue = '';
                }
                initialValue = defaultValue;
            }
            return Object.assign({}, props, {
                value: undefined,
                children: '' + initialValue
            });
        },
        select: function select(props, inst) {
            inst.currentSelectValue = props.value != null ? props.value : props.defaultValue;
            return Object.assign({}, props, {
                value: undefined
            });
        },
        option: function option(props, inst) {
            var selected = null;
            var selectValue = inst.currentSelectValue;
            var optionChildren = flattenOptionChildren(props.children);
            if (selectValue != null) {
                var value = void 0;
                if (props.value != null) {
                    value = props.value + '';
                } else {
                    value = optionChildren;
                }
                selected = false;
                if (Array.isArray(selectValue)) {
                    for (var j = 0; j < selectValue.length; j++) {
                        if ('' + selectValue[j] === value) {
                            selected = true;
                            break;
                        }
                    }
                } else {
                    selected = '' + selectValue === value;
                }
                return Object.assign({
                    selected: undefined,
                    children: undefined
                }, props, {
                    selected: selected,
                    children: optionChildren
                });
            } else {
                return props;
            }
        }
    };

    var HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
    var MATH_NAMESPACE = 'http://www.w3.org/1998/Math/MathML';
    var SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
    var Namespaces = {
        html: HTML_NAMESPACE,
        mathml: MATH_NAMESPACE,
        svg: SVG_NAMESPACE
    };
    function getIntrinsicNamespace(type) {
        switch (type) {
            case 'svg':
                return SVG_NAMESPACE;
            case 'math':
                return MATH_NAMESPACE;
            default:
                return HTML_NAMESPACE;
        }
    }
    function getChildNamespace(parentNamespace, type) {
        if (parentNamespace == null || parentNamespace === HTML_NAMESPACE) {
            return getIntrinsicNamespace(type);
        }
        if (parentNamespace === SVG_NAMESPACE && type === 'foreignObject') {
            return HTML_NAMESPACE;
        }
        return parentNamespace;
    }

    var _typeof$2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
    function invariant(a, condition) {
        if (a === false) {
            console.warn(condition);
        }
    }
    var omittedCloseTags = oneObject('area,base,br,col,embed,hr,img,input,keygen,link,meta,param,source,track,wbr');
    var toArray$1 = Children.toArray;
    var newlineEatingTags = oneObject('listing,pre,textarea');
    function shouldConstruct(Component) {
        return Component.prototype && Component.prototype.isReactComponent;
    }
    function getNonChildrenInnerMarkup(props) {
        var innerHTML$$1 = props.dangerouslySetInnerHTML;
        if (innerHTML$$1 != null) {
            if (innerHTML$$1.__html != null) {
                return innerHTML$$1.__html;
            }
        } else {
            var content = props.children;
            var n = typeNumber(content);
            if (n === 3 || n === 4) {
                return encodeEntities(content);
            }
        }
        return null;
    }
    function flattenTopLevelChildren(children) {
        if (!isValidElement(children)) {
            return toArray$1(children);
        }
        var element = children;
        if (element.type !== REACT_FRAGMENT_TYPE) {
            return [element];
        }
        var fragmentChildren = element.props.children;
        if (!isValidElement(fragmentChildren)) {
            return toArray$1(fragmentChildren);
        }
        return [fragmentChildren];
    }
    function processContext(type, context) {
        var contextTypes = type.contextTypes;
        if (!contextTypes) {
            return emptyObject;
        }
        var maskedContext = {};
        for (var contextName in contextTypes) {
            maskedContext[contextName] = context[contextName];
        }
        return maskedContext;
    }
    function ReactDOMServerRenderer(children, makeStaticMarkup) {
        var flatChildren = flattenTopLevelChildren(children);
        var topFrame = {
            type: null,
            domNamespace: Namespaces.html,
            children: flatChildren,
            childIndex: 0,
            context: emptyObject,
            footer: ''
        };
        this.stack = [topFrame];
        this.exhausted = false;
        this.currentSelectValue = null;
        this.previousWasTextNode = false;
        this.makeStaticMarkup = makeStaticMarkup;
        this.contextIndex = -1;
        this.contextStack = [];
        this.contextValueStack = [];
    }
    ReactDOMServerRenderer.prototype = {
        constructor: ReactDOMServerRenderer,
        pushProvider: function pushProvider(provider) {
            var index = ++this.contextIndex;
            var context = provider.type._context;
            var previousValue = context._currentValue;
            this.contextStack[index] = context;
            this.contextValueStack[index] = previousValue;
            context._currentValue = provider.props.value;
        },
        popProvider: function popProvider() {
            var index = this.contextIndex;
            var context = this.contextStack[index];
            var previousValue = this.contextValueStack[index];
            this.contextStack[index] = null;
            this.contextValueStack[index] = null;
            this.contextIndex--;
            context._currentValue = previousValue;
        },
        read: function read(bytes) {
            if (this.exhausted) {
                return null;
            }
            var out = '';
            while (out.length < bytes) {
                if (this.stack.length === 0) {
                    this.exhausted = true;
                    break;
                }
                var frame = this.stack[this.stack.length - 1];
                if (frame.childIndex >= frame.children.length) {
                    var footer = frame.footer;
                    out += footer;
                    if (footer !== '') {
                        this.previousWasTextNode = false;
                    }
                    this.stack.pop();
                    if (frame.type === 'select') {
                        this.currentSelectValue = null;
                    } else if (frame.type != null && frame.type.type != null && frame.type.type.$$typeof === REACT_PROVIDER_TYPE) {
                        var provider = frame.type;
                        this.popProvider(provider);
                    }
                    continue;
                }
                var child = frame.children[frame.childIndex++];
                out += this.render(child, frame.context, frame.domNamespace);
            }
            return out;
        },
        render: function render(child, context, parentNamespace) {
            var t = typeNumber(child);
            if (t === 3 || t === 4) {
                var text = '' + child;
                if (text === '') {
                    return '';
                }
                if (this.makeStaticMarkup) {
                    return encodeEntities(text);
                }
                if (this.previousWasTextNode) {
                    return '<!-- -->' + encodeEntities(text);
                }
                this.previousWasTextNode = true;
                return encodeEntities(text);
            } else {
                var nextChild = void 0;
                var _resolve = resolve(child, context);
                nextChild = _resolve.child;
                context = _resolve.context;
                if (nextChild === null || nextChild === false) {
                    return '';
                } else if (!isValidElement(nextChild)) {
                    if (nextChild != null && nextChild.$$typeof != null) {
                        var $$typeof = nextChild.$$typeof;
                        invariant($$typeof !== REACT_PORTAL_TYPE, 'Portals are not currently supported by the server renderer. ' + 'Render them conditionally so that they only appear on the client render.');
                        invariant(false, 'Unknown element-like object type: ' + $$typeof + '. This is likely a bug in React. ' + 'Please file an issue.');
                    }
                    var nextChildren = toArray$1(nextChild);
                    var frame = {
                        type: null,
                        domNamespace: parentNamespace,
                        children: nextChildren,
                        childIndex: 0,
                        context: context,
                        footer: ''
                    };
                    this.stack.push(frame);
                    return '';
                }
                var nextElement = nextChild;
                var elementType = nextElement.type;
                if (typeNumber(elementType) === 4) {
                    return this.renderDOM(nextElement, context, parentNamespace);
                }
                switch (elementType) {
                    case REACT_STRICT_MODE_TYPE:
                    case REACT_ASYNC_MODE_TYPE:
                    case REACT_PROFILER_TYPE:
                    case REACT_FRAGMENT_TYPE:
                        {
                            var _nextChildren = toArray$1(nextChild.props.children);
                            var _frame = {
                                type: null,
                                domNamespace: parentNamespace,
                                children: _nextChildren,
                                childIndex: 0,
                                context: context,
                                footer: ''
                            };
                            this.stack.push(_frame);
                            return '';
                        }
                    default:
                        break;
                }
                if ((typeof elementType === 'undefined' ? 'undefined' : _typeof$2(elementType)) === 'object' && elementType !== null) {
                    switch (elementType.$$typeof) {
                        case REACT_FORWARD_REF_TYPE:
                            {
                                var element = nextChild;
                                var _nextChildren2 = toArray$1(elementType.render(element.props, element.ref));
                                var _frame2 = {
                                    type: null,
                                    domNamespace: parentNamespace,
                                    children: _nextChildren2,
                                    childIndex: 0,
                                    context: context,
                                    footer: ''
                                };
                                this.stack.push(_frame2);
                                return '';
                            }
                        case REACT_PROVIDER_TYPE:
                            {
                                var provider = nextChild;
                                var nextProps = provider.props;
                                var _nextChildren3 = toArray$1(nextProps.children);
                                var _frame3 = {
                                    type: provider,
                                    domNamespace: parentNamespace,
                                    children: _nextChildren3,
                                    childIndex: 0,
                                    context: context,
                                    footer: ''
                                };
                                this.pushProvider(provider);
                                this.stack.push(_frame3);
                                return '';
                            }
                        case REACT_CONTEXT_TYPE:
                            {
                                var consumer = nextChild;
                                var _nextProps = consumer.props;
                                var nextValue = consumer.type._currentValue;
                                var _nextChildren4 = toArray$1(_nextProps.children(nextValue));
                                var _frame4 = {
                                    type: nextChild,
                                    domNamespace: parentNamespace,
                                    children: _nextChildren4,
                                    childIndex: 0,
                                    context: context,
                                    footer: ''
                                };
                                this.stack.push(_frame4);
                                return '';
                            }
                        default:
                            break;
                    }
                }
                var info = '';
                invariant(false, 'Element type is invalid: expected a string (for built-in ' + 'components) or a class/function (for composite components) ' + 'but got: %s.%s', elementType == null ? elementType : typeof elementType === 'undefined' ? 'undefined' : _typeof$2(elementType), info);
            }
        },
        renderDOM: function renderDOM(element, context, parentNamespace) {
            var tag = element.type.toLowerCase();
            var namespace = parentNamespace;
            if (parentNamespace === Namespaces.html) {
                namespace = getIntrinsicNamespace(tag);
            }
            var props = element.props;
            if (isFn(duplexMap[tag])) {
                props = duplexMap[tag](props, this);
            }
            var out = createOpenTagMarkup(element.type, tag, props, namespace, this.makeStaticMarkup, this.stack.length === 1);
            var footer = '';
            if (omittedCloseTags.hasOwnProperty(tag)) {
                out += '/>';
            } else {
                out += '>';
                footer = '</' + element.type + '>';
            }
            var children = void 0;
            var innerMarkup = getNonChildrenInnerMarkup(props);
            if (innerMarkup != null) {
                children = [];
                if (newlineEatingTags[tag] && innerMarkup.charAt(0) === '\n') {
                    out += '\n';
                }
                out += innerMarkup;
            } else {
                children = toArray$1(props.children);
            }
            var frame = {
                domNamespace: getChildNamespace(parentNamespace, element.type),
                type: tag,
                children: children,
                childIndex: 0,
                context: context,
                footer: footer
            };
            this.stack.push(frame);
            this.previousWasTextNode = false;
            return out;
        }
    };
    function resolve(child, context) {
        while (isValidElement(child)) {
            var element = child;
            var Component = element.type;
            if (!isFn(Component)) {
                break;
            }
            processChild(element, Component);
        }
        function processChild(element, Component) {
            var publicContext = processContext(Component, context);
            var queue = [];
            var replace = false;
            var updater = {
                isMounted: function isMounted$$1() {
                    return false;
                },
                enqueueForceUpdate: function enqueueForceUpdate() {
                    if (queue === null) {
                        return null;
                    }
                },
                enqueueReplaceState: function enqueueReplaceState(publicInstance, completeState) {
                    replace = true;
                    queue = [completeState];
                },
                enqueueSetState: function enqueueSetState(publicInstance, currentPartialState) {
                    if (queue === null) {
                        return null;
                    }
                    queue.push(currentPartialState);
                }
            };
            var inst = void 0;
            var hasGSFP = isFn(Component.getDerivedStateFromProps);
            if (shouldConstruct(Component)) {
                inst = new Component(element.props, publicContext, updater);
                if (hasGSFP) {
                    var partialState = Component.getDerivedStateFromProps.call(null, element.props, inst.state);
                    if (partialState != null) {
                        inst.state = Object.assign({}, inst.state, partialState);
                    }
                }
            } else {
                inst = Component(element.props, publicContext, updater);
                if (inst == null || inst.render == null) {
                    child = inst;
                    return;
                }
            }
            inst.props = element.props;
            inst.context = publicContext;
            inst.updater = updater;
            var initialState = inst.state;
            if (initialState === undefined) {
                inst.state = initialState = null;
            }
            var willMountHook = hasGSFP ? 'UNSAFE_componentWillMount' : 'componentWillMount';
            if (isFn(inst[willMountHook])) {
                inst[willMountHook]();
                if (queue.length) {
                    var oldQueue = queue;
                    var oldReplace = replace;
                    queue = null;
                    replace = false;
                    if (oldReplace && oldQueue.length === 1) {
                        inst.state = oldQueue[0];
                    } else {
                        var nextState = oldReplace ? oldQueue[0] : inst.state;
                        var dontMutate = true;
                        for (var i = oldReplace ? 1 : 0; i < oldQueue.length; i++) {
                            var partial = oldQueue[i];
                            var _partialState = isFn(partial) ? partial.call(inst, nextState, element.props, publicContext) : partial;
                            if (_partialState != null) {
                                if (dontMutate) {
                                    dontMutate = false;
                                    nextState = Object.assign({}, nextState, _partialState);
                                } else {
                                    Object.assign(nextState, _partialState);
                                }
                            }
                        }
                        inst.state = nextState;
                    }
                } else {
                    queue = null;
                }
            }
            child = inst.render();
            if (isFn(inst.getChildContext)) {
                var childContext = inst.getChildContext();
                if (childContext) {
                    context = Object.assign({}, context, childContext);
                }
            }
        }
        return {
            child: child,
            context: context
        };
    }

    function renderToString(element) {
        var renderer = new ReactDOMServerRenderer(element, false);
        var markup = renderer.read(Infinity);
        return markup;
    }
    function renderToStaticMarkup(element) {
        var renderer = new ReactDOMServerRenderer(element, true);
        var markup = renderer.read(Infinity);
        return markup;
    }
    var ReactMarkupReadableStream = miniCreateClass(function ReactMarkupReadableStream(element, makeStaticMarkup) {
        this.partialRenderer = new ReactDOMServerRenderer(element, makeStaticMarkup);
    }, {
        _read: function _read(size) {
            try {
                this.push(this.partialRenderer.read(size));
            } catch (err) {
                this.emit('error', err);
            }
        }
    }, stream.Readable);
    function renderToNodeStream(element) {
        return new ReactMarkupReadableStream(element, false);
    }
    function renderToStaticNodeStream(element) {
        return new ReactMarkupReadableStream(element, true);
    }

    exports.renderToString = renderToString;
    exports.renderToStaticMarkup = renderToStaticMarkup;
    exports.renderToNodeStream = renderToNodeStream;
    exports.renderToStaticNodeStream = renderToStaticNodeStream;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
