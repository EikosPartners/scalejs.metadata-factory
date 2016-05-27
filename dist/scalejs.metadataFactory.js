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

	var _scalejs = __webpack_require__(7);

	var _scalejs2 = _interopRequireDefault(_scalejs);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var core = _scalejs2.default.core;

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
/***/ function(module, exports) {

	module.exports = require("scalejs");

/***/ }
/******/ ]);