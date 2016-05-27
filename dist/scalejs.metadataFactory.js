/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	__webpack_require__(1);

	var _knockout = __webpack_require__(2);

	var _knockout2 = _interopRequireDefault(_knockout);

	var _lodash = __webpack_require__(3);

	var _lodash2 = _interopRequireDefault(_lodash);

	var _metadataFactory = __webpack_require__(4);

	var _metadataFactory2 = _interopRequireDefault(_metadataFactory);

	var _moment = __webpack_require__(5);

	var _moment2 = _interopRequireDefault(_moment);

	__webpack_require__(6);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var core = __webpack_require__(7);

	core.mvvm.registerTemplates(_metadataFactory2.default);

	var has = core.object.has,
	    is = core.type.is,
	    computed = _knockout2.default.computed,
	    evaluate = core.expression.evaluate,
	    observable = _knockout2.default.observable,
	    observableArray = _knockout2.default.observableArray,
	    viewModels = {
	    '': defaultViewModel,
	    context: contextViewModel
	},
	    schemas = {},
	    identifiers = {},
	    useDefault = true;

	function createViewModel(node) {
	    var rendered = observable(true),
	        context = this;

	    node = _lodash2.default.cloneDeep(node); //clone the node to stop mutation issues

	    // if(!this || !this.metadata) {
	    //     console.warn('Creating viewmodel without metadata context. If metadata context is desired, call this function using "this"');
	    // }
	    if (node && node.type === 'ignore') {
	        console.log('ignored node ', node);
	    } else {
	        var mappedNode = viewModels[node.type] ? viewModels[node.type].call(this, node) : defaultViewModel.call(this, node);

	        if (mappedNode && has(node.rendered)) {
	            rendered = is(node.rendered, 'boolean') ? observable(node.rendered) : computed(function () {
	                return evaluate(node.rendered, function (id) {
	                    if (context.getValue && has(context.getValue(id))) {
	                        return context.getValue(id);
	                    }
	                    if (id === 'role') {
	                        return core.userservice.role();
	                    }
	                    return '';
	                });
	            });
	        }
	        if (mappedNode) {
	            mappedNode.type = mappedNode.type || node.type;
	            mappedNode.rendered = rendered;
	        }
	        return mappedNode;
	    }
	}

	function createViewModels(metadata) {
	    var metadataContext;

	    // if(!this || !this.metadata) {
	    //     console.warn('A new instance of metadata has been detected, therefore a new context will be created');
	    // }

	    // allows all viewmodels created in the same instane of metadata
	    // to share context (as long as createViewModels is called correctly)
	    if (this && this.metadata) {
	        metadataContext = this;
	    } else {
	        metadataContext = {
	            metadata: metadata,
	            // default getValue can grab from the store
	            getValue: function getValue(id) {
	                if (id === 'store' && core.noticeboard.global) {
	                    return _knockout2.default.unwrap(core.noticeboard.global.dictionary);
	                }
	                if (id === '_') {
	                    return _lodash2.default;
	                }
	                if (id == 'Date') {
	                    return function (d) {
	                        return (0, _moment2.default)(d).toDate().getTime();
	                    };
	                }
	                if (id == 'IncrementDate') {
	                    return function (d, t, s) {
	                        return (0, _moment2.default)(d).add(t, s).toDate().getTime();
	                    };
	                }
	                return identifiers[id];
	            }
	        };
	    }

	    return metadata.map(function (item) {
	        return createViewModel.call(metadataContext, item);
	    }).filter(function (vm) {
	        // filter undefined or null from the viewmodels array
	        return has(vm);
	    });
	}

	function createTemplate(metadata, context) {
	    if (!metadata) {
	        return core.mvvm.template('metadata_loading_template');
	    }
	    if (!Array.isArray(metadata)) {
	        metadata = [metadata];
	    }

	    var viewModels = !context ? createViewModels(metadata) : createViewModels.call(context, metadata);

	    return core.mvvm.template('metadata_items_template', viewModels);
	}

	function defaultViewModel(node) {
	    if (!useDefault) {
	        return;
	    }
	    return core.object.merge(node, {
	        template: 'metadata_default_template'
	    });
	}

	function contextViewModel(node) {
	    var newContextProps = {};
	    Object.keys(node).forEach(function (prop) {
	        if (prop === 'type') {
	            return;
	        }
	        if (Array.isArray(node[prop])) {
	            newContextProps[prop] = observableArray(node[prop]);
	        } else {
	            newContextProps[prop] = observable(node[prop]);
	        }
	    });
	    core.object.extend(this, newContextProps);
	}

	function registerViewModels(newViewModels) {
	    core.object.extend(viewModels, newViewModels);
	}

	function getRegisteredTypes() {
	    return Object.keys(viewModels);
	}

	function registerIdentifiers(ids) {
	    core.object.extend(identifiers, ids);
	}

	function dispose(metadata) {
	    // clean up clean up everybody everywhere
	    _knockout2.default.unwrap(metadata).forEach(function (node) {
	        if (node.dispose) {
	            node.dispose();
	        }
	        dispose(node.mappedChildNodes || []);
	    });
	}

	function registerSchema(schema) {
	    for (var key in schema) {
	        // if( schemas.hasOwnProperty(key) ){
	        if (key !== '') {
	            schemas[key] = schema[key];
	        }
	    }
	}

	function generateSchema() {

	    //Basic schema layout for pjson
	    var schema = {
	        '$schema': 'http://json-schema.org/draft-04/schema#',
	        'definitions': {
	            'template': {
	                'type': 'string'
	            },
	            'type': {
	                'type': 'string'
	            },
	            'templateExt': {
	                'oneOf': [
	                // case where no template is provided
	                {
	                    'not': {
	                        'required': ['template']
	                    }
	                }]
	            },
	            'typeExt': {
	                'oneOf': []
	            },
	            'children': {
	                'type': 'array',
	                'items': {
	                    '$ref': '#/definitions/subObject'
	                }
	            },
	            'options': {
	                'type': 'object'
	            },
	            'classes': {
	                'type': 'string'
	            },
	            'subObject': {
	                'allOf': [{
	                    // Base properties
	                    'type': 'object',
	                    'properties': {
	                        'template': {}, // makes sure template/type show up as options
	                        'type': {},
	                        'children': {
	                            '$ref': '#/definitions/children'
	                        },
	                        'options': {
	                            '$ref': '#/definitions/options'
	                        }
	                    },
	                    'required': ['type']
	                },
	                // populates templates, types, and corresponding options
	                {
	                    '$ref': '#/definitions/typeExt'
	                }, {
	                    '$ref': '#/definitions/templateExt'
	                }]
	            }
	        },
	        'oneOf': [{
	            '$ref': '#/definitions/subObject'
	        }, {
	            'type': 'array',
	            'items': {
	                '$ref': '#/definitions/subObject'
	            }
	        }]
	    };

	    //Add all templates to the schema
	    var option;
	    var otherTemplates = [];
	    for (var key in core.mvvm.getRegisteredTemplates()) {
	        if (key !== '') {
	            if (schemas.hasOwnProperty(key)) {
	                // Add extended templates
	                option = {
	                    'properties': {
	                        'template': {
	                            'enum': [key]
	                        },
	                        'options': {
	                            'type': 'object',
	                            'properties': schemas[key]
	                        }
	                    },
	                    'required': ['template'] // ensures matching template
	                };
	                schema.definitions.templateExt.oneOf.push(option);
	            } else {
	                otherTemplates.push(key);
	            }
	        }
	    }
	    if (otherTemplates.length > 0) {
	        // Add regular templates
	        schema.definitions.template.enum = otherTemplates;
	        option = {
	            'properties': {
	                'template': {
	                    '$ref': '#/definitions/template'
	                }
	            },
	            'required': ['template'] // ensures matching template
	        };
	        schema.definitions.templateExt.oneOf.push(option);
	    }

	    //Add all types to the schema
	    var otherTypes = [];
	    for (var key in viewModels) {
	        if (key !== '') {
	            if (schemas.hasOwnProperty(key + '_template')) {
	                // Add extended types
	                var option = {
	                    'properties': {
	                        'type': {
	                            'enum': [key]
	                        },
	                        'options': {
	                            'type': 'object',
	                            'properties': schemas[key + '_template']
	                        }
	                    }
	                };
	                schema.definitions.typeExt.oneOf.push(option);
	            } else {
	                otherTypes.push(key);
	            }
	        }
	    }
	    if (otherTypes.length > 0) {
	        // Add regular types
	        schema.definitions.type.enum = otherTypes;
	        option = {
	            'properties': {
	                'type': {
	                    '$ref': '#/definitions/type'
	                }
	            }
	        };
	        schema.definitions.typeExt.oneOf.push(option);
	    }

	    return schema;
	}

	_knockout2.default.bindingHandlers.metadataFactory = {
	    init: function init() {
	        return {
	            controlsDescendantBindings: true
	        };
	    },
	    update: function update(element, valueAccessor, allBindings, viewModel, bindingContext) {

	        var metadata = _knockout2.default.unwrap(valueAccessor()).metadata ? _knockout2.default.unwrap(valueAccessor()).metadata : _knockout2.default.unwrap(valueAccessor()),
	            context = _knockout2.default.unwrap(valueAccessor()).context ? _knockout2.default.unwrap(valueAccessor()).context : null,
	            prevMetadata;

	        function disposeMetadata() {
	            prevMetadata = _knockout2.default.utils.domData.get(element, 'metadata');

	            if (prevMetadata) {
	                prevMetadata = Array.isArray(prevMetadata) ? prevMetadata : [prevMetadata];
	                dispose(prevMetadata);
	            }
	        }

	        setTimeout(function () {
	            var metadataTemplate = createTemplate(metadata, context).template;

	            disposeMetadata();

	            _knockout2.default.utils.domData.set(element, 'metadata', metadataTemplate.data);

	            _knockout2.default.bindingHandlers.template.update(element, function () {
	                return metadataTemplate;
	            }, allBindings, viewModel, bindingContext);

	            // first time running - set dom node disposal
	            if (!prevMetadata) {
	                _knockout2.default.utils.domNodeDisposal.addDisposeCallback(element, function () {
	                    disposeMetadata();
	                });
	            }
	        });
	    }

	};

	exports.default = core.registerExtension({
	    metadataFactory: {
	        createTemplate: createTemplate,
	        registerViewModels: registerViewModels,
	        createViewModels: createViewModels,
	        createViewModel: createViewModel,
	        useDefault: useDefault,
	        registerIdentifiers: registerIdentifiers,
	        getRegisteredTypes: getRegisteredTypes
	    }
	});

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = require("scalejs.mvvm");

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = require("knockout");

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("lodash");

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = "<div id=\"metadata_items_template\">\r\n    <!-- ko template: { name: 'metadata_item_template', foreach: $data } -->\r\n\r\n    <!--/ko -->\r\n</div>\r\n\r\n<div id=\"metadata_item_template\">\r\n    <!-- ko comment: $data.template || $data.type + '_template' -->\r\n    <!-- /ko -->\r\n    <!-- ko if: ($data.rendered == null) ? true : $data.rendered  -->\r\n    <!-- ko template: $data.template || $data.type + '_template' -->\r\n    <!-- /ko -->\r\n    <!-- /ko -->\r\n</div>\r\n\r\n<div id=\"metadata_default_template\">\r\n    <div data-bind=\"text: JSON.stringify($data)\"></div>\r\n</div>\r\n\r\n<div id=\"metadata_loading_template\">\r\n    <div class=\"loader hexdots-loader\">\r\n    loading...\r\n    </div>\r\n</div>\r\n\r\n<div id=\"no_template\">    \r\n    <div data-bind=\"template: { name: 'metadata_items_template', data: mappedChildNodes}\"></div>\r\n</div>\r\n";

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = require("moment");

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = require("scalejs.expression-jsep");

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _scalejsEs = __webpack_require__(8);

	var _scalejsEs2 = _interopRequireDefault(_scalejsEs);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	module.exports = _scalejsEs2.default;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _scalejs = __webpack_require__(9);

	var _scalejs2 = _interopRequireDefault(_scalejs);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// Imports
	var has = _scalejs2.default.object.has,
	    is = _scalejs2.default.type.is,
	    extend = _scalejs2.default.object.extend,
	    addOne = _scalejs2.default.array.addOne,
	    error = _scalejs2.default.log.error,


	/**
	 * Holds the core
	 * @property self
	 * @type Object
	 * @memberOf core
	 * @private
	 */
	self = {},

	/**
	 * Holds extensions for the core and sandbox
	 * @property extensions
	 * @type Array
	 * @memberOf core
	 * @private
	 */
	extensions = [],

	/**
	 * Holds application event listeners
	 * @property applicationEventListeners
	 * @type Array
	 * @memberOf core
	 * @private
	 */
	applicationEventListeners = [],

	/**
	 * Holds the current application state
	 * @property isApplicationRunning
	 * @type Boolean
	 * @memberOf core
	 * @private
	 */
	_isApplicationRunning = false;

	/**
	 * Registers an extension to the sandbox
	 *
	 * @param {Function|Object} extension function to create the extension or
	 *                                    object representing the extension
	 * @memberOf core
	 */
	/**
	 * Provides core functionality of scalejs
	 * @namespace scalejs.core
	 * @module core
	 */

	/*global define*/
	function registerExtension(extension) {
	    try {
	        var ext; // Actual extension

	        if (is(extension, 'buildCore', 'function')) {
	            // If extension has buildCore function then give it an instance of the core.
	            extension.buildCore(self);
	            addOne(extensions, extension);
	            return; // No need to extend as that will be handled in buildCore
	        }

	        if (is(extension, 'function')) {
	            // If extension is a function then give it an instance of the core.
	            ext = extension(self);
	        } else if (has(extension, 'core')) {
	            // If extension has `core` property then extend core with it.
	            ext = extension.core;
	        } else {
	            // Otherwise extend core with the extension itself.
	            ext = extension;
	        }

	        if (ext) {
	            extend(self, ext);
	            addOne(extensions, extension);
	        }
	    } catch (ex) {
	        error('Fatal error during application initialization. ', 'Failed to build core with extension "', extension, 'See following exception for more details.', ex);
	    }

	    return extension;
	}

	/**
	 * Builds a sandbox from the current list of extensions
	 *
	 * @param {String} id identifier for the sandbox
	 * @memberOf core
	 * @return {Object} object representing the built sandbox
	 */
	function buildSandbox(id) {
	    if (!has(id)) {
	        throw new Error('Sandbox name is required to build a sandbox.');
	    }

	    // Create module instance specific sandbox
	    var sandbox = {
	        type: self.type,
	        object: self.object,
	        array: self.array,
	        log: self.log
	    };

	    // Add extensions to sandbox
	    extensions.forEach(function (extension) {
	        try {

	            // If extension has buildSandbox method use it to build sandbox
	            if (is(extension, 'buildSandbox', 'function')) {
	                extension.buildSandbox(sandbox);
	            }

	            // If extension has a sandbox object add it
	            else if (has(extension, 'sandbox')) {
	                    extend(sandbox, extension.sandbox);
	                }

	                // Otherwise extend the sandbox with the extension
	                else {
	                        extend(sandbox, extension);
	                    }
	        } catch (ex) {
	            error('Fatal error during application initialization. ', 'Failed to build sandbox with extension "', extension, 'See following exception for more details.', ex);
	            throw ex;
	        }
	    });

	    return sandbox;
	}

	/**
	 * Adds a listener to the application event
	 *
	 * @param {Function} listener called on application event
	 * @param {String}   listener.message event description
	 * @memberOf core
	 */
	function onApplicationEvent(listener) {
	    applicationEventListeners.push(listener);
	}

	/**
	 * Notify the event listeners the application has started
	 *
	 * @memberOf core
	 */
	function notifyApplicationStarted() {
	    if (_isApplicationRunning) {
	        return;
	    }

	    _isApplicationRunning = true;
	    applicationEventListeners.forEach(function (listener) {
	        listener('started');
	    });
	}

	/**
	 * Notify the event listeners the application has stopped
	 *
	 * @memberOf core
	 */
	function notifyApplicationStopped() {
	    if (!_isApplicationRunning) {
	        return;
	    }

	    _isApplicationRunning = false;
	    applicationEventListeners.forEach(function (listener) {
	        listener('stopped');
	    });
	}

	/**
	 * Constant for notifying application start
	 *
	 * @property STARTED
	 * @type String
	 * @memberOf core
	 */
	Object.defineProperty(self, 'STARTED', {
	    value: 'started',
	    writable: false
	});

	/**
	 * Constant for notifying application stop
	 *
	 * @property STOPPED
	 * @type String
	 * @memberOf core
	 */
	Object.defineProperty(self, 'STOPPED', {
	    value: 'stopped',
	    writable: false
	});

	exports.default = extend(self, {
	    type: _scalejs2.default.type,
	    object: _scalejs2.default.object,
	    array: _scalejs2.default.array,
	    log: _scalejs2.default.log,
	    buildSandbox: buildSandbox,
	    notifyApplicationStarted: notifyApplicationStarted,
	    notifyApplicationStopped: notifyApplicationStopped,
	    onApplicationEvent: onApplicationEvent,
	    registerExtension: registerExtension,
	    /**
	     * Accesses the current state of the application
	     *
	     * @memberOf core
	     * @return {Boolean} state of the application
	     */
	    isApplicationRunning: function isApplicationRunning() {
	        return _isApplicationRunning;
	    }

	});

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _scalejsBase = __webpack_require__(10);

	var _scalejsBase2 = _interopRequireDefault(_scalejsBase);

	var _scalejsBase3 = __webpack_require__(13);

	var _scalejsBase4 = _interopRequireDefault(_scalejsBase3);

	var _scalejsBase5 = __webpack_require__(11);

	var _scalejsBase6 = _interopRequireDefault(_scalejsBase5);

	var _scalejsBase7 = __webpack_require__(12);

	var _scalejsBase8 = _interopRequireDefault(_scalejsBase7);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/*
	 * Minimal base implementation.
	 */

	/*global define*/
	exports.default = {
	    type: _scalejsBase8.default,
	    object: _scalejsBase6.default,
	    array: _scalejsBase2.default,
	    log: _scalejsBase4.default
	};

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _scalejsBase = __webpack_require__(11);

	var _scalejsBase2 = _interopRequireDefault(_scalejsBase);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var valueOrDefault = _scalejsBase2.default.valueOrDefault;

	/**
	 * Adds an item to the passed array if it doesn't already exist
	 *
	 * @param {Array} array list to add the item to
	 * @param {Any}   item  thing to add to the list
	 * @memberOf array
	 */
	/**
	 * Provides array functionality to scalejs base
	 * @namespace scalejs.base
	 * @module array
	 */

	/*global define*/
	function addOne(array, item) {
	    if (array.indexOf(item) < 0) {
	        array.push(item);
	    }
	}

	/**
	 * Removes the first occurrance of the passed item from the passed array
	 *
	 * @param {Array} array list remove the item from
	 * @param {Any}   item  item to be removed from the list
	 * @memberOf array
	 */
	function removeOne(array, item) {
	    var found = array.indexOf(item);
	    if (found > -1) {
	        array.splice(found, 1);
	    }
	}

	/**
	 * Removes all items from an array
	 *
	 * @param {Array} array list to remove items from
	 * @memberOf array
	 */
	function removeAll(array) {
	    array.splice(0, array.length);
	}

	/**
	 * Copy the items from the array into a new one
	 *
	 * @param {Array}  array   list to copy from
	 * @param {Number} [first] starting index to copy from (defult:0)
	 * @param {Number} [count] number of items to copy (default:array.length)
	 * @memberOf array
	 * @return {Array} copied list
	 */
	function copy(array, first, count) {
	    first = valueOrDefault(first, 0);
	    count = valueOrDefault(count, array.length);
	    return Array.prototype.slice.call(array, first, count);
	}

	/**
	 * Finds the passed item in the array
	 *
	 * @param {Array}    array   list in which to search
	 * @param {Function} f       function to seach with
	 * @param {Any}      content context on which to call the function
	 * @memberOf array
	 * @return {Any|Object} item if found, null if not
	 */
	function find(array, f, context) {
	    var i, // iterative variable
	    l; // array length variable

	    for (i = 0, l = array.length; i < l; i += 1) {
	        if (array.hasOwnProperty(i) && f.call(context, array[i], i, array)) {
	            return array[i];
	        }
	    }

	    return null;
	}

	/**
	 * Converts object structured like array into an array
	 *
	 * @param {Any}    list    object structred with numerical keys
	 * @param {Number} [first] starting index to copy from (defult:0)
	 * @param {Number} [count] number of items to copy (default:array.length)
	 * @memberOf array
	 * @return {Array} result of the array conversion
	 */
	function toArray(list, start, count) {
	    return copy(list, start, count);
	}

	exports.default = {
	    addOne: addOne,
	    removeOne: removeOne,
	    removeAll: removeAll,
	    copy: copy,
	    find: find,
	    toArray: toArray
	};

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; }; /**
	                                                                                                                                                                                                                                                   * Provides object functionality to scalejs base
	                                                                                                                                                                                                                                                   * @namespace scalejs.base
	                                                                                                                                                                                                                                                   * @module object
	                                                                                                                                                                                                                                                   */

	/*global define*/


	var _scalejsBase = __webpack_require__(12);

	var _scalejsBase2 = _interopRequireDefault(_scalejsBase);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var is = _scalejsBase2.default.is;

	/**
	 * Determines if an object exists and if it does checks that each in
	 * the chain of properties also exist
	 *
	 * @param {Object|Any} obj       object to test
	 * @param {String}     [prop...] property chain of the object to test
	 * @memberOf object
	 * @return {Boolean} if the object 'has' (see inline documentation)
	 */
	function has(object) {
	    // The intent of this method is to replace unsafe tests relying on type
	    // coercion for optional arguments or obj properties:
	    // | function on(event,options){
	    // |   options = options || {}; // type coercion
	    // |   if (!event || !event.data || !event.data.value){
	    // |     // unsafe due to type coercion: all falsy values '', false, 0
	    // |     // are discarded, not just null and undefined
	    // |     return;
	    // |   }
	    // |   // ...
	    // | }
	    // with a safer test without type coercion:
	    // | function on(event,options){
	    // |   options = has(options)? options : {}; // no type coercion
	    // |   if (!has(event,'data','value'){
	    // |     // safe check: only null/undefined values are rejected;
	    // |     return;
	    // |   }
	    // |   // ...
	    // | }
	    //
	    // Returns:
	    //   * false if no argument is provided or if the obj is null or
	    //     undefined, whatever the number of arguments
	    //   * true if the full chain of nested properties is found in the obj
	    //     and the corresponding value is neither null nor undefined
	    //   * false otherwise

	    var i,
	        // iterative variable
	    length,
	        o = object,
	        property;

	    if (!is(o)) {
	        return false;
	    }

	    for (i = 1, length = arguments.length; i < length; i += 1) {
	        property = arguments[i];
	        o = o[property];
	        if (!is(o)) {
	            return false;
	        }
	    }

	    return true;
	}

	/**
	 * Deep extend of the supplier into the reciever
	 * @private
	 *
	 * @param {Object} reciever object into which to extend
	 * @param {Object} supplier object from which to extend
	 * @memberOf object
	 * @return the reciever object for ease
	 */
	function mix(receiver, supplier) {
	    var p;
	    for (p in supplier) {
	        if (supplier.hasOwnProperty(p)) {
	            if (has(supplier, p) && has(receiver, p) && supplier[p].constructor === Object) {
	                receiver[p] = mix(receiver[p], supplier[p]);
	            } else {
	                receiver[p] = supplier[p];
	            }
	        }
	    }

	    return receiver;
	}

	/**
	 * Merges all of the passed objects into a new object
	 *
	 * @param {Object} [obj...] object to mix into the new object
	 * @memberOf object
	 * @return {Object} the merged object
	 */
	function merge() {
	    var args = arguments,
	        i,
	        // iterative variable
	    len = args.length,
	        result = {};

	    for (i = 0; i < len; i += 1) {
	        mix(result, args[i]);
	    }

	    return result;
	}

	/**
	 * Clones the passed object
	 *
	 * @param {Object} obj object to be cloned
	 * @memberOf object
	 * @return {Object} the cloned object
	 */
	function clone(o) {
	    return merge(o);
	}

	/**
	 * Extends the extension into the reciever
	 *
	 * @param {Object} reciever  object into which to extend
	 * @param {Object} extension object from which to extend
	 * @param {String} [path]    followed on the reciever before executing
	 *                           the extend (form: "obj.obj.obj")
	 * @memberOf object
	 * @return the extended object (after having followed the path)
	 */
	function extend(receiver, extension, path) {
	    var props = has(path) ? path.split('.') : [],
	        target = receiver,
	        i; // iterative variable

	    for (i = 0; i < props.length; i += 1) {
	        if (!has(target, props[i])) {
	            target[props[i]] = {};
	        }
	        target = target[props[i]];
	    }

	    mix(target, extension);

	    return target;
	}

	/**
	 * Obtains a value from an object following a path with the option to
	 * return a default value if that object was not found
	 *
	 * @param {Object} o    object in which to look for the specified path
	 * @param {String} path string representing the chain of properties to
	 *                      to be followed (form: "obj.obj.obj")
	 * @param {Any}    [defaultValue] value to return if the path does not
	 *                                evaluate successfully: default undefined
	 * @memberOf object
	 * @return {Any} object evaluated by following the given path or the default
	 *               value should that object not exist
	 */
	function get(o, path, defaultValue) {
	    var props = path.split('.'),
	        i,
	        // iterative variable
	    p,
	        // current property
	    success = true;

	    for (i = 0; i < props.length; i += 1) {
	        p = props[i];
	        if (has(o, p)) {
	            o = o[p];
	        } else {
	            success = false;
	            break;
	        }
	    }

	    return success ? o : defaultValue;
	}

	/**
	 * Gives the value if it exists or the default value if not
	 *
	 * @param {Any} value item to check
	 * @param {Any} [defaultValue] item to return if value does not exist
	 * @memberOf object
	 * @return value if it exists or default if not
	 */
	function valueOrDefault(value, defaultValue) {
	    return has(value) ? value : defaultValue;
	}

	/**
	 * Stringifies an object without the chance for circular error
	 *
	 * @param {Object} obj object to stringify
	 * @memberOf object
	 * @return {String} string form of the passed object
	 */
	function stringify(obj) {
	    var cache = [];

	    return JSON.stringify(obj, function (key, value) {
	        if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && value !== null) {
	            if (cache.indexOf(value) !== -1) {
	                return '[Circular]';
	            }
	            cache.push(value);
	        }
	        return value;
	    });
	}

	exports.default = {
	    has: has,
	    valueOrDefault: valueOrDefault,
	    merge: merge,
	    extend: extend,
	    clone: clone,
	    get: get,
	    stringify: stringify
	};

/***/ },
/* 12 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	/**
	 * Provides type functionality to scalejs base
	 * @namespace scalejs.base
	 * @module type
	 */

	/*global define*/

	/**
	 * Detects the type of the passed object
	 *
	 * @param {Any} obj object to find the type of
	 * @memberOf type
	 * @return {String} type of the passed object
	 */
	function typeOf(obj) {
	    if (obj === undefined) {
	        return 'undefined';
	    }

	    if (obj === null) {
	        return 'null';
	    }

	    var t = Object.prototype.toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase(),
	        m;

	    if (t !== 'object') {
	        return t;
	    }

	    m = obj.constructor.toString().match(/^function\s*([$A-Z_][0-9A-Z_$]*)/i);
	    if (m === null) {
	        return 'object';
	    }

	    return m[1];
	}

	/**
	 * Determines if an object (and possibly a chain of properties within
	 * that object actually are of the passed type
	 * (no type will be null/undefined)
	 *
	 * @param {Any}        value     object to test
	 * @param {String}     [prop...] property chain to test within value
	 * @param {Any|String} [type]    type of the object to test for
	 * @memberOf type
	 * @return {Boolean} if the object 'is' (see inline documentation)
	 */
	function is(value) {
	    // If more than two arguments are provided, the value is considered to be
	    // nested within a chain of properties starting with the first argument:
	    // | is(object,'parent','child','leaf','boolean')
	    // will check whether the property object.parent.child.leaf exists and is
	    // a boolean.
	    //
	    // The intent of this method is to replace unsafe guard conditions that
	    // rely on type coercion:
	    // | if (object && object.parent && object.parent.child) {
	    // |   // Issue: all falsy values are treated like null and undefined:
	    // |   // '', 0, false...
	    // | }
	    // with a safer check in a single call:
	    // | if ( is(object,'parent','child','number') ) {
	    // |   // only null and undefined values are rejected
	    // |   // and the type expected (here 'number') is explicit
	    // | }
	    //
	    // Returns:
	    //   * false, if no argument is provided
	    //   * false, if a single argument is provided which is null or undefined
	    //   * true, if a single argument is provided, which is not null/undefined
	    //   * if the type argument is a non-empty string, it is compared with the
	    //     internal class of the value, put in lower case
	    //   * if the type argument is a function, the instanceof operator is used
	    //     to check if the value is considered an instance of the function
	    //   * otherwise, the value is compared with the provided type using the
	    //     strict equality operator ===
	    //
	    // Notes:
	    // This method retrieves the internal class of the provided value using
	    // | Object.prototype.toString.call(value).slice(8, -1)
	    // The class is then converted to lower case.
	    //
	    // See "The Class of an Object" section in the JavaScript Garden for
	    // more details on the internal class:
	    // http://bonsaiden.github.com/JavaScript-Garden/#types.typeof
	    //
	    // The internal class is only guaranteed to be the same in all browsers for
	    // Core JavaScript classes defined in ECMAScript. It differs for classes
	    // part of the Browser Object Model (BOM) and Document Object Model (DOM):
	    // window, document, DOM nodes:
	    //
	    //   window        - 'Object' (IE), 'Window' (Firefox,Opera),
	    //                   'global' (Chrome), 'DOMWindow' (Safari)
	    //   document      - 'Object' (IE),
	    //                   'HTMLDocument' (Firefox,Chrome,Safari,Opera)
	    //   document.body - 'Object' (IE),
	    //                   'HTMLBodyElement' (Firefox,Chrome,Safari,Opera)
	    //   document.createElement('div') - 'Object' (IE)
	    //                   'HTMLDivElement' (Firefox,Chrome,Safari,Opera)
	    //   document.createComment('') - 'Object' (IE),
	    //                   'Comment' (Firefox,Chrome,Safari,Opera)

	    // do not trust global undefined, which may be overridden
	    var undef = void 0,
	        i,
	        // iterative variable
	    length = arguments.length,
	        last = length - 1,
	        type,
	        typeOfType,
	        internalClass,
	        v = value;

	    if (length === 0) {
	        return false; // no argument
	    }

	    if (length === 1) {
	        return value !== null && value !== undef;
	    }

	    if (length > 2) {
	        for (i = 0; i < last - 1; i += 1) {
	            if (!is(v)) {
	                return false;
	            }
	            v = v[arguments[i + 1]];
	        }
	    }

	    type = arguments[last];
	    if (v === null) {
	        return type === null || type === 'null';
	    }
	    if (v === undef) {
	        return type === undef || type === 'undefined';
	    }
	    if (type === '') {
	        return v === type;
	    }

	    typeOfType = typeof type === 'undefined' ? 'undefined' : _typeof(type);
	    if (typeOfType === 'string') {
	        internalClass = Object.prototype.toString.call(v).slice(8, -1).toLowerCase();
	        return internalClass === type;
	    }

	    if (typeOfType === 'function') {
	        return v instanceof type;
	    }

	    return v === type;
	}

	exports.default = {
	    is: is,
	    typeOf: typeOf
	};

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _scalejsBase = __webpack_require__(11);

	var _scalejsBase2 = _interopRequireDefault(_scalejsBase);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// Workaround for IE8 and IE9 - in these browsers console.log exists but it's not a real JS function.
	// See http://stackoverflow.com/a/5539378/201958 for more details

	/*jslint sub:true*/
	/**
	 * Aliases the built in console log function for IE support
	 *
	 * @property log
	 * @type Function
	 * @memberOf log
	 * @private
	 */
	var log = Function.prototype.call.bind(console['log'], console),


	/**
	 * Detects if the current browser is IE
	 *
	 * IMPORTANT: the method for obtaining this information is
	 *            subject to change and this functionality may
	 *            break at any time
	 *
	 * @property IE
	 * @type Boolean
	 * @memberOf log
	 * @private
	 */
	IE = navigator.userAgent.indexOf('MSIE') > 0 || navigator.userAgent.indexOf('Trident') > 0;

	/*jslint sub:false*/

	/**
	 * Creates a new log function with the passed level
	 * @private
	 *
	 * @param {String} level log level
	 * @memberOf log
	 * @return {Function} decorated log function
	 */
	/**
	 * Provides logging functionality to scalejs base
	 * @namespace scalejs.base
	 * @module log
	 */

	/*global define,console,navigator*/
	function create(level) {
	    return function () {
	        var args, outstring;

	        args = Array.prototype.slice.call(arguments, 0);

	        if (!IE) {
	            args.unshift(level);
	        } else {
	            outstring = level + ' ';
	            args.forEach(function (arg) {
	                outstring += _scalejsBase2.default.stringify(arg) + ' ';
	            });
	            args = [outstring];
	        }

	        log.apply(this, arguments);
	    };
	}

	/**
	 * Formats an exception for better output
	 *
	 * @param {Object} ex exception object
	 * @memberOf log
	 * @return {String} formatted exception
	 */
	function formatException(ex) {
	    var stack = ex.stack ? String(ex.stack) : '',
	        message = ex.message || '';
	    return 'Error: ' + message + '\nStack: ' + stack;
	}

	exports.default = {
	    /**
	     * Logs to the console with no level
	     * @method log
	     * @param {Any} [message...] items to print to the console
	     * @memberOf log
	     */
	    log: create('      '),
	    /**
	     * Logs to the console with info level
	     * @method info
	     * @param {Any} [message...] items to print to the console
	     * @memberOf log
	     */
	    info: create('info: '),
	    /**
	     * Logs to the console with error level
	     * @method error
	     * @param {Any} [message...] items to print to the console
	     * @memberOf log
	     */
	    error: create('error:'),
	    /**
	     * Logs to the console with warn level
	     * @method warn
	     * @param {Any} [message...] items to print to the console
	     * @memberOf log
	     */
	    warn: create('warn: '),
	    /**
	     * Logs to the console with debug level
	     * @method debug
	     * @param {Any} [message...] items to print to the console
	     * @memberOf log
	     */
	    debug: create('debug:'),
	    /** */
	    formatException: formatException
	};

/***/ }
/******/ ]);