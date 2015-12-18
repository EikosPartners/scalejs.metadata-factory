
define('text!scalejs.metadataFactory/metadataFactory.html',[],function () { return '<div id="metadata_items_template">\n    <!-- ko template: { name: \'metadata_item_template\', foreach: $data } -->\n\n    <!--/ko -->\n</div>\n\n<div id="metadata_item_template">\n    <!-- ko comment: $data.template || $data.type + \'_template\' -->\n    <!-- /ko -->\n    <!-- ko template: $data.template || $data.type + \'_template\' -->\n    <!-- /ko -->\n</div>\n\n<div id="metadata_default_template">\n    <div data-bind="text: JSON.stringify($data)"></div>\n</div>\n\n<div id="metadata_loading_template">\n    <div class="loader hexdots-loader">\n    loading...\n    </div>\n</div>';});


define('text!scalejs.metadataFactory/action/views/action.html',[],function () { return '<div id="action_template">\n    <div data-bind="css: $data.classes" class="action-button-wrapper">\n        <button data-class="action-button">\n            <span data-bind="text: text"></span>\n        </button>\n    </div>\n</div>';});

/*global define */
/*jslint sloppy: true*/
define('scalejs.metadataFactory/action/bindings/actionBindings.js',{
    'action-button': function () {
        var classes = this.buttonClasses || '';
        
        if (this.icon) {
            classes += ' fa fa-' + this.icon;
        }
        
        return {
            click: function() {
                this.action();
            },
            css: classes
        }
    }
});

/*global define, ko, core, view, binding */
define('scalejs.metadataFactory/action/viewmodels/actionViewModel',[
    'scalejs!core',
    'knockout',
    'text!scalejs.metadataFactory/action/views/action.html',
    'scalejs.metadataFactory/action/bindings/actionBindings.js',
    'scalejs.reactive',
    'scalejs.mvvm'
], function (
    core,
    ko,
    view,
    binding
) {
    'use strict';

    var merge = core.object.merge,
        notify = core.reactive.messageBus.notify,
        observable = ko.observable,
        unwrap = ko.unwrap;
        
    core.mvvm.registerTemplates(view);
    core.mvvm.registerBindings(binding);
    
    function notifyAction(options) {
        notify(unwrap(options.target), options.params);
    }

    return function actionViewModel(node) {
        var registeredActions = core.metadataFactory.getRegisteredActions();
        var text = node.text || node.options.text,
            validate = node.validate,
            options = node.options || {},
            actionType = node.actionType,
            actions = {
                notify: notifyAction
            },
            mergedActions = core.object.extend(actions, registeredActions),
            actionFunc = mergedActions[actionType] || null,
            isShown = observable(true),
            context = this;

        if (actionFunc) {
            actionFunc = actionFunc.bind(this);
        }

        function action() {
            
            if (!actionFunc){
                console.error('actions[actionType] is not defined', node);
                return;
            }

            if (validate) {
                notify(validate, {
                    successCallback: actionFunc,
                    options: options
                });
            } else {
                actionFunc(options, arguments);
            }
        }

        return merge(node, {
            isShown: isShown,
            action: action,
            text: text,
            actionType: actionType,
            options: options,
            context: context
        });
    };
});

/*global define, actionViewModel, sandbox,core,  avm  */
define('scalejs.metadataFactory/action/actionModule',[
    'scalejs!core',
    'scalejs.metadataFactory/action/viewmodels/actionViewModel',
    'scalejs.mvvm'
], function (
    core,
    avm
) {
    'use strict';
    var actionViewModel = avm,  
        registeredActions = {};
    
    function getRegisteredActions()
    {
        return registeredActions;
    }

    function registerActions(actions)
    {
        core.object.extend(registeredActions, actions);
    }
     
    return {action:  actionViewModel,
            registerActions: registerActions,
            getRegisteredActions: getRegisteredActions};
});
/*global define, core, _, ko */
define('scalejs.metadataFactory/template/templateViewModel',[
    'scalejs!core',
    'lodash',
    'knockout'
    
], function (
    core,
    _,
    ko
) {
    'use strict';

   return  function templateViewModel (node, metadata) {
        var observable = ko.observable,
            merge = core.object.merge,
            createViewModel = core.metadataFactory.createViewModel.bind(this), // passes context
            createViewModels = core.metadataFactory.createViewModels.bind(this), // passes context
            // properties
            actionNode = _.cloneDeep(node.action),
            action,
            data = observable(node.data || {}),
            mappedChildNodes;
        function getValue(key) {
            return (data() || {})[key];
        }

        mappedChildNodes = createViewModels(node.children || []);

        if (actionNode) {
            action = createViewModel(actionNode).action;
        } else {
            action = function () {};
        }

        if(node.actionEndpoint){
            
            // create a callback object that the ajaxAction knows how to use.
            // this is the alternative to the lously coupled nextactions[] || error actions. 
            var callback = { callback: function(err, results){
                if(err) {
                    console.log('ajax request error',err);
                    return;
                }
                data(results);
            }}
            createViewModel(node.actionEndpoint).action(callback);
        }

        return merge(node, {
            mappedChildNodes: mappedChildNodes,
            action: action,
            data: data,
            context: this
        });
    }
});

define('scalejs.metadataFactory',[
    'scalejs!core',
    'knockout',
    'text!scalejs.metadataFactory/metadataFactory.html',
    'scalejs.metadataFactory/action/actionModule',
    'scalejs.metadataFactory/template/templateViewModel',
    'scalejs.mvvm'

], function (
    core,
    ko,
    view,
    actionModule,
    templateViewModel
) {
    'use strict';

    core.mvvm.registerTemplates(view);

    var has = core.object.has,
        viewModels = {
            '': defaultViewModel,
            context: contextViewModel,
            action: actionModule.action,
            template: templateViewModel
        },
        schemas = {
                
        },
        useDefault = true;

    function createViewModel(node) {
        // if(!this || !this.metadata) {
        //     console.warn('Creating viewmodel without metadata context. If metadata context is desired, call this function using "this"');
        // }
        if (node && node.type === 'ignore' ) {
            console.log('ignored node ', node);
        } else {
            var mappedNode = viewModels[node.type] ? viewModels[node.type].call(this, node) : defaultViewModel.call(this, node);
            if (mappedNode) {
                mappedNode.type = mappedNode.type || node.type;
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
                metadata: metadata
            };
        }

        return metadata.map(function (item) {
            return createViewModel.call(metadataContext, item)
        }).filter(function (vm) {
            // filter undefined or null from the viewmodels array
            return has(vm);
        });
    }

    function createTemplate(metadata, context) {
        if(!metadata) {
            return core.mvvm.template('metadata_loading_template');
        }
        if (!Array.isArray(metadata)) {
            metadata = [metadata];
        }

        var viewModels =  !context ? createViewModels(metadata) : createViewModels.call(context, metadata);

        return core.mvvm.template('metadata_items_template', viewModels);
    }

    function defaultViewModel(node) {
        if(!useDefault) {
            return;
        }
        return core.object.merge(node, {
            template: 'metadata_default_template'
        });
    }

    function contextViewModel(node) {
        core.object.extend(this, node);
    }

    function registerViewModels(newViewModels) {
        core.object.extend(viewModels, newViewModels);
    }

    function dispose(metadata) {
        // clean up clean up everybody everywhere
        ko.unwrap(metadata).forEach(function (node) {
            if(node.dispose) {
                node.dispose();
            }
            dispose(node.mappedChildNodes || []);
        })
    }

    function registerSchema(schema) {
        for( var key in schema ){
            if( schemas.hasOwnProperty(key) ){
                schemas[key] = schema[key];
            }
        }
    }

    function generateSchema() {

        //Basic schema layout for pjson
        var schema = {
            // '$schema': 'http://json-schema.org/draft-04/schema#',
            'type':'object',
            'anyOf':[]           
        };
        //Add all types to the schema
        // for( var key in viewModels ){
        //     if( key !== '' ){
        //         schema.oneOf.push({
        //             "type":"object",
        //             "properties":{
        //                 "type":{
        //                     "type":"string",
        //                     "enum":[key]
        //                 },
        //                 "children":{
        //                     "type":"array",
        //                     "items":{"#ref":"#"}
        //                 }
        //             }    
        //         });
        //     }
        // }
        //Add all templates to the schema
        for( var key in core.mvvm.getRegisteredTemplates() ){
            if( key !== '' ){
                var sTemplate = {
                    'properties':{
                        'template':{
                            'type':'string',
                            'enum':[key]
                        },
                        'children':{
                            'type':'array',
                            'items':{'$ref':'#'}
                        }
                    }    
                };
                // if( schemas[key] && schemas[key].options ){
                //     sTemplate.properties.options = {
                //         "type":"object",
                //         "properties":{},
                //         "required":[]
                //     }
                //     for( var option in schemas[key].options ){
                //         sTemplate.properties.options.properties[option] = 
                //         schemas[key].options[option];
                //         sTemplate.properties.options.required.push(option);
                //     }
                // }
                schema.anyOf.push(sTemplate);
            }
        }
        
        return schema;

    }

    ko.bindingHandlers.metadataFactory = {
        init: function () {
            return { controlsDescendantBindings: true };
        },
        update: function (
            element,
            valueAccessor,
            allBindings,
            viewModel,
            bindingContext
        ) {


            var metadata = ko.unwrap(valueAccessor()).metadata ? ko.unwrap(valueAccessor()).metadata : ko.unwrap(valueAccessor()),
                context = ko.unwrap(valueAccessor()).context ? ko.unwrap(valueAccessor()).context : null,
                prevMetadata;

            function disposeMetadata() {
                prevMetadata = ko.utils.domData.get(element, 'metadata');

                if (prevMetadata) {
                    prevMetadata = Array.isArray(prevMetadata) ? prevMetadata : [prevMetadata];
                    dispose(prevMetadata);
                }
            }


            setTimeout(function () {
                var metadataTemplate = createTemplate(metadata, context).template;

                disposeMetadata();

                ko.utils.domData.set(element,'metadata', metadataTemplate.data);

                ko.bindingHandlers.template.update(
                    element,
                    function () {
                        return metadataTemplate;
                    },
                    allBindings,
                    viewModel,
                    bindingContext
                );

                // first time running - set dom node disposal
                if (!prevMetadata) {
                    ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                        disposeMetadata();
                    });
                }
            });
        }

    }
    var metadatafactory = { metadataFactory: {
            createTemplate: createTemplate,
            registerViewModels: registerViewModels,
            createViewModels: createViewModels,
            createViewModel: createViewModel,
            useDefault: useDefault,
            registerActions: actionModule.registerActions,
            getRegisteredActions: actionModule.getRegisteredActions,
            generateSchema: generateSchema,
            registerSchema: registerSchema
    }};

    core.registerExtension(metadatafactory);
    return metadatafactory;

});

