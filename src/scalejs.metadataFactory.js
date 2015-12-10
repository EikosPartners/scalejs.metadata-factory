define([
    'scalejs!core',
    'knockout',
    'text!scalejs.metadataFactory/metadataFactory.html',
    'userservice',
    'scalejs.mvvm',
    'scalejs.expression-jsep'
], function (
    core,
    ko,
    view,
    userService
) {
    'use strict';

    core.mvvm.registerTemplates(view);

    var has = core.object.has,
        is = core.type.is,
        computed = ko.computed,
        evaluate = core.expression.evaluate,
        observable = ko.observable,
        viewModels = {
            '': defaultViewModel,
            context: contextViewModel
        },
        useDefault = true;

    function createViewModel(node) {
        var rendered = observable(true),
            context = this;
        
        // if(!this || !this.metadata) {
        //     console.warn('Creating viewmodel without metadata context. If metadata context is desired, call this function using "this"');
        // }
        if (node && node.type === 'ignore' ) {
            console.log('ignored node ', node);
        } else {
            var mappedNode = viewModels[node.type] ? viewModels[node.type].call(this, node) : defaultViewModel.call(this, node);
            
                    
            if (mappedNode && has(node.rendered)) {
                rendered = is(node.rendered, 'boolean') ? observable(node.rendered)
                    : computed(function() {
                        return evaluate(node.rendered, function (id) {
                            if (context.getValue && has(context.getValue(id))) {
                                return context.getValue(id);
                            }
                            if (id === 'role') {
                                return userService.role();
                            }
                            return '';
                        })
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

    core.registerExtension({
        metadataFactory: {
            createTemplate: createTemplate,
            registerViewModels: registerViewModels,
            createViewModels: createViewModels,
            createViewModel: createViewModel,
            useDefault: useDefault
        }
    });
});
