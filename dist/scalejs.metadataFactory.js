'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _knockout = require('knockout');

var _knockout2 = _interopRequireDefault(_knockout);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _metadataFactory = require('./views/metadataFactory.html');

var _metadataFactory2 = _interopRequireDefault(_metadataFactory);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _scalejs = require('scalejs.sandbox');

var _scalejs2 = _interopRequireDefault(_scalejs);

var _scalejs3 = require('scalejs');

var _scalejs4 = _interopRequireDefault(_scalejs3);

var _scalejs5 = require('scalejs.core');

var _scalejs6 = _interopRequireDefault(_scalejs5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//var core = scalejs.core;
//import 'scalejs.mvvm';

//import 'scalejs.expression-jsep';
_scalejs6.default.mvvm.registerTemplates(_metadataFactory2.default);

var has = _scalejs6.default.object.has,
    is = _scalejs6.default.type.is,
    computed = _knockout2.default.computed,
    evaluate = _scalejs6.default.expression.evaluate,
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
                        return _scalejs6.default.userservice.role();
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
                if (id === 'store' && _scalejs6.default.noticeboard.global) {
                    return _knockout2.default.unwrap(_scalejs6.default.noticeboard.global.dictionary);
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
        return _scalejs6.default.mvvm.template('metadata_loading_template');
    }
    if (!Array.isArray(metadata)) {
        metadata = [metadata];
    }

    var viewModels = !context ? createViewModels(metadata) : createViewModels.call(context, metadata);

    return _scalejs6.default.mvvm.template('metadata_items_template', viewModels);
}

function defaultViewModel(node) {
    if (!useDefault) {
        return;
    }
    return _scalejs6.default.object.merge(node, {
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
    _scalejs6.default.object.extend(this, newContextProps);
}

function registerViewModels(newViewModels) {
    _scalejs6.default.object.extend(viewModels, newViewModels);
}

function getRegisteredTypes() {
    return Object.keys(viewModels);
}

function registerIdentifiers(ids) {
    _scalejs6.default.object.extend(identifiers, ids);
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
    for (var key in _scalejs6.default.mvvm.getRegisteredTemplates()) {
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

exports.default = _scalejs6.default.registerExtension({
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