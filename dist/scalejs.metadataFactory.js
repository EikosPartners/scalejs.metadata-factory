'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getRegisteredTypes = exports.registerIdentifiers = exports.useDefault = exports.createViewModel = exports.createViewModels = exports.registerViewModels = exports.createTemplate = undefined;

var _scalejs = require('scalejs.mvvm');

var _knockout = require('knockout');

var _knockout2 = _interopRequireDefault(_knockout);

var _scalejs2 = require('scalejs.noticeboard');

var noticeboard = _interopRequireWildcard(_scalejs2);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _metadataFactory = require('./views/metadataFactory.html');

var _metadataFactory2 = _interopRequireDefault(_metadataFactory);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _scalejs3 = require('scalejs.expression-jsep');

var _scalejs4 = require('scalejs');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _scalejs.registerTemplates)(_metadataFactory2.default);

var viewModels = {
    '': defaultViewModel,
    context: contextViewModel
},
    schemas = {},
    identifiers = {},
    useDefault = true;

function createViewModel(node) {
    var rendered = (0, _knockout.observable)(true),
        context = this;

    node = _lodash2.default.cloneDeep(node); //clone the node to stop mutation issues

    // if(!this || !this.metadata) {
    //     console.warn('Creating viewmodel without metadata context. If metadata context is desired, call this function using "this"');
    // }
    if (node && node.type === 'ignore') {
        console.log('ignored node ', node);
    } else {
        var mappedNode;
        if (viewModels[node.type]) {
            mappedNode = viewModels[node.type].call(this, node);
        } else {
            console.log('no viewModel of type ' + node.type + ' was found');
            mappedNode = defaultViewModel.call(this, node);
        }

        if (mappedNode && (0, _scalejs4.has)(node.rendered)) {
            rendered = (0, _scalejs4.is)(node.rendered, 'boolean') ? (0, _knockout.observable)(node.rendered) : (0, _knockout.computed)(function () {
                return (0, _scalejs3.evaluate)(node.rendered, function (id) {
                    if (context.getValue && (0, _scalejs4.has)(context.getValue(id))) {
                        return context.getValue(id);
                    }
                    //if (id === 'role') {
                    //    return core.userservice.role();
                    //}
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
    // allows all viewmodels created in the same instane of metadata
    // to share context (as long as createViewModels is called correctly)
    if (this && this.metadata) {
        metadataContext = this;
    } else {
        metadataContext = {
            metadata: metadata,
            // default getValue can grab from the store
            getValue: function getValue(id) {
                if (id === 'store' && noticeboard.dictonary) {
                    return _knockout2.default.unwrap(noticeboard.dictionary);
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
        return (0, _scalejs4.has)(vm);
    });
}

function createTemplate(metadata, context) {
    if (!metadata) {
        return (0, _scalejs.template)('metadata_loading_template');
    }
    if (!Array.isArray(metadata)) {
        metadata = [metadata];
    }

    var viewModels = !context ? createViewModels(metadata) : createViewModels.call(context, metadata);

    return (0, _scalejs.template)('metadata_items_template', viewModels);
}

function defaultViewModel(node) {
    if (!useDefault) {
        return;
    }
    return (0, _scalejs4.merge)(node, {
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
            newContextProps[prop] = (0, _knockout.observableArray)(node[prop]);
        } else {
            newContextProps[prop] = (0, _knockout.observable)(node[prop]);
        }
    });
    _lodash2.default.extend(this, newContextProps);
}

function registerViewModels(newViewModels) {
    _lodash2.default.extend(viewModels, newViewModels);
}

function getRegisteredTypes() {
    return Object.keys(viewModels);
}

function registerIdentifiers(ids) {
    _lodash2.default.extend(identifiers, ids);
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
    for (var key in (0, _scalejs.getRegisteredTemplates)()) {
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

_knockout2.default.bindingHandlers.metadataSync = {}; // optional for MD factory

_knockout2.default.bindingHandlers.metadataFactory = {
    init: function init() {
        return {
            controlsDescendantBindings: true
        };
    },
    update: function update(element, valueAccessor, allBindings, viewModel, bindingContext) {

        var value = _knockout2.default.unwrap(valueAccessor()) || {};

        var metadata = value.metadata ? value.metadata : value,
            sync = allBindings().metadataSync,
            context = value.context ? value.context : null,
            prevMetadata;

        function disposeMetadata() {
            prevMetadata = _knockout2.default.utils.domData.get(element, 'metadata');

            if (prevMetadata) {
                prevMetadata = Array.isArray(prevMetadata) ? prevMetadata : [prevMetadata];
                dispose(prevMetadata);
            }
        }

        function applyMetadataBinding() {
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
        }

        if (sync) {
            applyMetadataBinding();
        } else {
            setTimeout(applyMetadataBinding);
        }
    }

};

exports.createTemplate = createTemplate;
exports.registerViewModels = registerViewModels;
exports.createViewModels = createViewModels;
exports.createViewModel = createViewModel;
exports.useDefault = useDefault;
exports.registerIdentifiers = registerIdentifiers;
exports.getRegisteredTypes = getRegisteredTypes;
//# sourceMappingURL=scalejs.metadataFactory.js.map