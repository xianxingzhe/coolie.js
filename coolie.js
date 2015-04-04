/*!
 * coolie 苦力
 * @author ydr.me
 * @version 0.7.0
 * @license MIT
 */


(function () {
    /**
     * coolie 版本号
     * @type {string}
     */
    var version = '0.7.0';

    /**
     * window
     * @type {Window}
     */
    var win = window;


    /**
     * document
     * @type {HTMLDocument}
     */
    var doc = win.document;


    /**
     * coolie 配置
     * @property base {String} 模块入口基准路径
     * @property version {Object} 入口模块版本 map
     * @type {Object}
     */
    var coolieConfig = {};


    /**
     * 判断数据类型
     * @param obj
     * @returns {string}
     */
    var typeis = function (obj) {
        return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
    };


    /**
     * 判断是否为数组
     * @param obj
     * @returns {Boolean}
     * @private
     */
    var isArray = function (obj) {
        return typeis(obj) === 'array';
    };


    /**
     * 判断是否为函数
     * @param obj
     * @returns {Boolean}
     * @private
     */
    var isFunction = function (obj) {
        return typeis(obj) === 'function';
    };


    /**
     * 判断是否为字符串
     * @param obj
     * @returns {Boolean}
     * @private
     */
    var isString = function (obj) {
        return typeis(obj) === 'string';
    };


    /**
     * 遍历
     * @param list
     * @param callback {Function} 返回 false，中断当前循环
     * @param [isReverse=false] {Boolean} 是否反序
     * @private
     */
    var each = function (list, callback, isReverse) {
        var i;
        var j;

        if (isArray(list)) {
            for (i = isReverse ? list.length - 1 : 0, j = isReverse ? 0 : list.length;
                 isReverse ? i > j : i < j;
                 isReverse ? i-- : i++) {
                if (callback(i, list[i]) === false) {
                    break;
                }
            }
        } else if (typeof(list) === 'object') {
            for (i in list) {
                if (list.hasOwnProperty(i)) {
                    if (callback(i, list[i]) === false) {
                        break;
                    }
                }
            }
        }
    };


    /**
     * 定义 console，防止出错
     */
    var console = (function () {
        var ret = {};
        var hasConsole = win.console;
        var arr = ['log', 'warn', 'group', 'groupEnd'];

        each(arr, function (index, key) {
            ret[key] = function () {
                if (hasConsole && hasConsole[key]) {
                    try {
                        hasConsole[key].apply(hasConsole, arguments);
                    } catch (err) {
                        //ignore
                    }
                }
            };
        });

        return ret;
    })();


    /**
     * 获取当前时间戳
     * @returns {Number}
     */
    var now = function () {
        return new Date().getTime();
    };


    /**
     * 目录结尾
     * @type {RegExp}
     */
    var REG_PATH_DIR = /\/[^/]+$/;


    /**
     * 获取路径所在的目录
     * @param path {String} 路径或目录
     * @returns {*}
     */
    var getPathDir = function (path) {
        path = path.replace(REG_HOST, '');

        if (path === '/') {
            return path;
        }

        return REG_PATH_DIR.test(path) ? path.replace(REG_PATH_DIR, '/') : path;
    };


    /**
     * 判断是否为绝对路径
     * @type {RegExp}
     */
    var REG_PATH_ABSOLUTE = /^\//;


    /**
     * 判断是否相对路径
     * @type {RegExp}
     */
    var REG_PATH_RELATIVE = /^(\.{1,2})\//;


    /**
     * 路径结尾
     * @type {RegExp}
     */
    var REG_PATH_END = /\/[^/]+?\/$/;


    /**
     * 路径合并
     * @param from {String} 标准的起始目录
     * @param to {String} 标准的目标路径
     * @returns {string} 标准的合并路径
     *
     * @example
     * path.j('/', '/');
     * // => '/'
     *
     * path.j('/a/b/c/', '/d/e/f');
     * // => '/d/e/f'
     *
     * path.j('/a/b/c/', './d/e/f');
     * // => '/a/b/c/d/e/f'
     *
     * path.j('/a/b/c/', '../../d/e/f');
     * // => '/a/d/e/f'
     */
    var getPathJoin = function (from, to) {
        if (REG_PATH_ABSOLUTE.test(to)) {
            return to;
        }

        var mathes;

        to = './' + to;

        while (mathes = to.match(REG_PATH_RELATIVE)) {
            to = to.replace(REG_PATH_RELATIVE, '');

            if (mathes[1].length === 2) {
                from = from.replace(REG_PATH_END, '/');
            }
        }

        return from + to;
    };


    /**
     * 获取标签列表
     * @param tagName {String} 标签名称
     * @param [parent] {Node|HTMLElement} 父节点
     * @returns {NodeList|*}
     */
    var getNodeList = function (tagName, parent) {
        return (parent || doc).getElementsByTagName(tagName);
    };


    /**
     * 文件后缀
     * @type {RegExp}
     */
    var REG_SUFFIX = /[\?#].*?$/;


    /**
     * host
     * @type {RegExp}
     */
    var REG_HOST = /https?:\/\/[^/]*/;


    /**
     * 脚本后缀
     * @type {RegExp}
     */
    var REG_JS = /\.js($|\?)/i;


    /**
     * 清理 url
     * @param url {String} 原始 URL
     * @param [isNotScript=false] 是否为非脚本
     * @returns {String}
     */
    var cleanURL = function (url, isNotScript) {
        url = url.replace(REG_SUFFIX, '');

        if (isNotScript) {
            return url;
        }

        return url + (REG_JS.test(url) ? '' : '.js');
    };


    /**
     * 获取 script 的绝对路径
     * @param script
     * @returns {*}
     */
    var getScriptAbsolutelyPath = function (script) {
        return cleanURL(script.hasAttribute ?
            // non-IE6/7
            script.src :
            // @see http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
            script.getAttribute('src', 4));
    };


    /**
     * 获取 node 的 dataset 值
     * @param node
     * @param dataKey
     * @returns {string}
     */
    var getNodeDataset = function (node, dataKey) {
        return node.getAttribute('data-' + dataKey);
    };


    /**
     * 是否加载完毕
     * @type {RegExp}
     */
    var REG_LOAD_COMPLETE = /loaded|complete/;


    /**
     * 头部标签
     * @type {HTMLHeadElement|*}
     */
    var docHead = doc.head || getNodeList('head', doc)[0];


    /**
     * 当前插入的脚本
     * @type {null|HTMLScriptElement|Node}
     */
    var curentAppendScript = null;


    /**
     * 加载的脚本列表
     * @type {Array}
     */
    var loadScriptList = [];


    /**
     * 文件后缀
     * @type {RegExp}
     */
    var REG_EXT = /\.[^.]*$/;


    /**
     * 构造版本 URL
     * @param url
     * @returns {*}
     */
    var buildVersionURL = function (url) {
        if (!coolieConfig._v) {
            return url;
        }

        var version = isString(coolieConfig._v) ? coolieConfig._v : coolieConfig._v[url];

        if (!version) {
            return url;
        }

        return url.replace(REG_EXT, '.' + version + '$&');
    };


    /**
     * 加载脚本
     * @param url {String} 脚本 URL
     * @param [callback] {Function} 加载完毕回调
     */
    var loadScript = function (url, callback) {
        var script = doc.createElement('script');
        var onready = function (eve) {
            eve = eve || win.event;

            if (eve && eve.type === 'error') {
                throw 'load script error: ' + url;
            }

            if (isFunction(callback)) {
                callback();
            }
        };

        loadScriptList.push(script);
        script.src = buildVersionURL(url);
        script.id = url;
        script.async = true;
        script.defer = true;
        script.onreadystatechange = function (eve) {
            if (REG_LOAD_COMPLETE.test(script.readyState)) {
                onready(eve);
            }
        };
        script.onload = script.onerror = onready;
        curentAppendScript = script;
        docHead.appendChild(script);
        curentAppendScript = null;
    };


    /**
     * 加载文本模块
     * @param url {String} 文本 URL
     */
    var ajaxText = function (url) {
        var xhr = new XMLHttpRequest();
        var hasComplete;
        var onready = function () {
            if (xhr.readyState === 4 && !hasComplete) {
                hasComplete = true;
                if (xhr.status === 200 || xhr.status === 304) {
                    defineModule({
                        _isAn: mainModule._isAn,
                        _time: now(),
                        id: url,
                        deps: [],
                        factory: function () {
                            return xhr.responseText;
                        }
                    });
                } else {
                    throw 'ajax error: ' + url;
                }
            }
        };

        xhr.onload = xhr.onreadystatechange = xhr.onerror = xhr.onabort = xhr.ontimeout = onready;
        xhr.open('GET', buildVersionURL(url));
        xhr.send(null);
    };


    /**
     * 活动脚本
     * @type {RegExp}
     */
    var REG_INTERACTIVE = /interactive/;


    /**
     * 获取当前正在执行的脚本路径
     * @returns {HTMLScriptElement}
     * @link https://github.com/seajs/seajs/blob/master/dist/sea-debug.js#L439
     */
    var getInteractiveScript = function () {
        // direct
        if (curentAppendScript) {
            return curentAppendScript;
        }

        // chrome
        if (doc.currentScript) {
            return doc.currentScript;
        }

        var interactiveScript = null;

        // IE6-10 得到当前正在执行的script标签
        var scripts = doc.scripts || getNodeList('script', docHead);

        each(scripts, function (index, script) {
            if (REG_INTERACTIVE.test(script.readyState)) {
                interactiveScript = script;
                return false;
            }
        }, true);

        if (interactiveScript) {
            return interactiveScript;
        }

        // 脚本的执行顺序与添加到 DOM 里的顺序一致
        return loadScriptList.shift();
    };


    /**
     * 当前运行的脚本
     * @type {Node}
     */
    var currentScript = getInteractiveScript();


    /**
     * 当前脚本的绝对路径
     * @type {String}
     */
    var currentScriptAbsolutelyPath = getScriptAbsolutelyPath(currentScript);


    /**
     * 当前脚本所在运行的 host
     */
    var currentScriptHost = currentScriptAbsolutelyPath.match(REG_HOST)[0];


    /**
     * 当前脚本的 data-config
     * @type {string}
     */
    var currentScriptDataConfig = getNodeDataset(currentScript, 'config');


    /**
     * 当前脚本的 data-main
     * @type {string}
     */
    var currentScriptDataMain = getNodeDataset(currentScript, 'main');


    /**
     * 当前运行脚本的绝对目录
     * @type {String}
     */
    var currentScriptAbsolutelyDir = getPathDir(currentScriptAbsolutelyPath);


    /**
     * 当前运行脚本配置文件路径
     * @type {string}
     */
    var currentScriptConfigPath = getPathJoin(currentScriptAbsolutelyDir, currentScriptDataConfig);


    /**
     * 当前运行脚本配置文件 URL
     * @type {string}
     */
    var currentScriptConfigURL = currentScriptHost + currentScriptConfigPath;


    /**
     * coolie
     * @type {Object}
     */
    var coolie = {};


    /**
     * coolie 版本号
     * @type {string}
     */
    coolie.version = version;


    /**
     * 入口模块的基准路径
     * @type {null|String}
     */
    var mainModuleBaseDir = null;


    /**
     * 入口模块
     * @type {Object}
     */
    var mainModule = {};


    /**
     * 是否可以执行入口模块
     * @type {boolean}
     */
    var canExecuteMain = false;


    /**
     * 是否已经执行了入口模块
     * @type {boolean}
     */
    var hasExecuteMain = false;


    /**
     * 依赖的模块
     * @type {{}}
     */
    var dependenceModules = {};


    /**
     * 注册的模块
     * @type {{}}
     */
    var defineModules = {};


    /**
     * 依赖长度，包括入口模块
     * @type {number}
     */
    var dependenceLength = 1;


    /**
     * 注册长度，包括入口模块
     * @type {number}
     */
    var defineLength = 0;


    /**
     * coolie 配置
     * @param config
     */
    coolie.config = function (config) {
        coolieConfig = config;
        mainModuleBaseDir = getPathJoin(currentScriptAbsolutelyDir, coolieConfig.base);

        coolieConfig.version = coolieConfig.version || {};

        if (isString(coolieConfig.version)) {
            coolieConfig._v = coolieConfig.version;
        } else {
            coolieConfig._v = {};
            each(coolieConfig.version, function (path, version) {
                coolieConfig._v[cleanURL(currentScriptHost + getPathJoin(mainModuleBaseDir, path))] = version;
            });
        }

        var mainModuleId = mainModule.id = cleanURL(currentScriptHost + getPathJoin(mainModuleBaseDir, currentScriptDataMain));

        mainModule._defined = false;
        mainModule._time = now();
        dependenceModules[mainModuleId] = mainModule;

        return coolie;
    };


    /**
     * 开始执行入口模块
     */
    coolie.use = function () {
        canExecuteMain = true;
    };


    /**
     * 执行入口模块
     */
    var executeMain = function () {
        if (hasExecuteMain) {
            return;
        }

        hasExecuteMain = true;

        loadScript(mainModule.id);
    };


    /**
     * require 正则
     * @type {RegExp}
     * @link https://github.com/seajs/seajs/blob/master/dist/sea-debug.js
     */
    var REG_REQUIRE = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g;


    /**
     * 反斜杠
     * @type {RegExp}
     */
    var REG_SLASH = /\\\\/g;


    /**
     * 解析代码里的依赖信息
     * @param code {String} 代码
     */
    var parseDependencies = function (code) {
        var requires = [];

        code.replace(REG_SLASH, '').replace(REG_REQUIRE, function (m, m1, m2) {
            if (m2) {
                requires.push(m2);
            }
        });

        return requires;
    };


    /**
     * 文本模块
     * @type {RegExp}
     */
    var REG_TEXT_MODULE = /^(css|html|text)!/i;


    /**
     * 注册 module
     * @param module
     * @returns module
     */
    var defineModule = function (module) {
        module.exports = {};
        module._execute = (function () {
            var require = function (dep) {
                var isTextModule = REG_TEXT_MODULE.test(dep);

                dep = dep.replace(REG_TEXT_MODULE, '');

                var depId = mainModule._isAn ? currentScriptHost + cleanURL(getPathJoin(module._path, dep), isTextModule) : dep;

                if (!defineModules[depId]) {
                    throw 'can not found module `' + depId + '`, but required in `' + module.id + '`';
                }

                return defineModules[depId]._execute();
            };

            return function () {
                var id = module.id;

                if (module._executed) {
                    return defineModules[id].exports;
                } else {
                    module._executed = true;
                    defineModules[id].exports = module.factory.call(window, require, module.exports, module) || module.exports;

                    return defineModules[id].exports;
                }
            };
        })();

        var id = module.id;

        defineModules[id] = module;
        defineLength++;
        console.log(id, now() - dependenceModules[id]._time + 'ms');

        if (defineLength === dependenceLength) {
            console.log('past', now() - mainModule._time + 'ms');
            console.groupEnd('coolie modules');
            mainModule._execute();
        }
    };


    /**
     * 定义一个模块
     * @param {String} [id] 模块id
     * @param {Array} [deps] 模块依赖
     * @param {Function} factory 模块方法
     */
    var define = function (id, deps, factory) {
        var args = arguments;
        var isAn = true;
        var interactiveScript = getInteractiveScript();
        var interactiveScriptURL = interactiveScript.id;
        var interactiveScriptPath = getPathDir(interactiveScriptURL);

        // define(id, deps, factory);
        if (isFunction(args[2])) {
            isAn = false;
        }
        // define(id, factory);
        else if (isFunction(args[1])) {
            id = null;
            deps = [];
            factory = args[1];
        }
        // define(factory);
        else if (isFunction(args[0])) {
            factory = args[0];
            deps = parseDependencies(factory.toString());
            id = null;
        }

        id = mainModule._defined && mainModule._isAn ? interactiveScriptURL : id || interactiveScriptURL;

        var module = {
            _isAn: isAn,
            _path: interactiveScriptPath,
            _time: now(),
            id: id,
            deps: deps,
            factory: factory
        };

        if (interactiveScriptURL === mainModule.id) {
            mainModule = module;
            mainModule._defined = true;
        }

        var deps2 = [];

        each(deps, function (index, dep) {
            var isTextModule = REG_TEXT_MODULE.test(dep);

            dep = dep.replace(REG_TEXT_MODULE, '');

            var path = deps[index] = getPathJoin(interactiveScriptPath, dep);
            var depId = cleanURL(currentScriptHost + path, isTextModule);

            if (!dependenceModules[depId]) {
                deps2.push(depId);
                dependenceModules[depId] = {
                    _time: now()
                };
                dependenceLength++;

                if (isTextModule) {
                    ajaxText(depId);
                } else {
                    loadScript(depId);
                }
            }
        });

        module.deps = deps2;
        defineModule(module);
    };


    // 加载配置脚本
    if (currentScriptConfigURL) {
        console.group('coolie modules');
        loadScript(currentScriptConfigURL, executeMain);
    }


    /**
     * @namespace coolie
     * @type {Object}
     */
    window.coolie = coolie;
    window.coolie.modules = defineModules;

    /**
     * @namespace define
     * @type {define}
     */
    window.define = define;
    window.define.amd = {};
    window.define.cmd = {};
})();
