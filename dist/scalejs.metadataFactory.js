
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
        unwrap = ko.unwrap,
        isShown = observable(true);
        
    core.mvvm.registerTemplates(view);
    core.mvvm.registerBindings(binding);
    
    function eventAction(options) {
        console.error('Please switch to notify actionType="notify" instead of event', options);
        notify(unwrap(options.target), options.params);
    }
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
                notify: notifyAction,
                event: eventAction,
            },
            mergedActions = core.object.extend(actions, registeredActions),
            actionFunc = mergedActions[actionType] || null;

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
                actionFunc(options);
            }
        }

        return merge(node, {
            isShown: isShown,
            action: action,
            text: text,
            actionType: actionType,
            options: options
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
    function registerAction(action)
    {
        core.object.extend(registeredActions, action);
    }
    
    function registerActions(actions)
    {
        core.object.extend(registeredActions, actions);
    }
     
    return {action:  actionViewModel,
            registerAction: registerAction, 
            registerActions: registerActions,
            getRegisteredActions: getRegisteredActions};
});
define('scalejs.metadataFactory',[
    'scalejs!core',
    'knockout',
    'text!scalejs.metadataFactory/metadataFactory.html',
    'scalejs.metadataFactory/action/actionModule',
    'scalejs.mvvm'
    
], function (
    core,
    ko,
    view,
    avm
) {
    'use strict';

    core.mvvm.registerTemplates(view);
    
    var has = core.object.has,
        viewModels = {
            '': defaultViewModel,
            context: contextViewModel,
            action: avm.action
        },
        useDefault = true;
        
    function createViewModel(node) {
        //if(!this || !this.metadata) {
            //console.warn('Creating viewmodel without metadata context. If metadata context is desired, call this function using "this"');
        //}
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

        //if(!this || !this.metadata) {
            //console.warn('A new instance of metadata has been detected, therefore a new context will be created');
        //}

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

    function createTemplate(metadata) {
        if(!metadata) {
            return core.mvvm.template('metadata_loading_template');
        }
        if (!Array.isArray(metadata)) {
            metadata = [metadata];
        }

        var viewModels = createViewModels(metadata);

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

            var metadata = ko.unwrap(valueAccessor()),
                prevMetadata;

            function disposeMetadata() {
                prevMetadata = ko.utils.domData.get(element, 'metadata');

                if (prevMetadata) {
                    prevMetadata = Array.isArray(prevMetadata) ? prevMetadata : [prevMetadata];
                    dispose(prevMetadata);
                }
            }


            setTimeout(function () {
                var metadataTemplate = createTemplate(metadata).template;

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
            registerAction : avm.registerAction,
            registerActions: avm.registerActions,
            getRegisteredActions: avm.getRegisteredActions
    }};
    
    core.registerExtension(metadatafactory);
    return metadatafactory;
});
