define([
    'scalejs!core',
    'knockout',
    'scalejs.mvvm.views!scalejs.metadata-factory/metadata-factory'
], function (
    core,
    ko
) {
    'use strict';

    var has = core.object.has,
        viewModels = {
            '': defaultViewModel,
            template: templateViewModel,
            context: contextViewModel
        },
        useDefault = true;

    function createViewModel(node) {
        if(!this || !this.metadata) {
            console.warn('Creating viewmodel without metadata context. If metadata context is desired, call this function using "this"');
        }
        var mappedNode = viewModels[node.type] ? viewModels[node.type].call(this, node) : defaultViewModel.call(this, node);
        if (mappedNode) {
            mappedNode.type = mappedNode.type || node.type;
        }
        return mappedNode;
    }

    function createViewModels(metadata) {
        var metadataContext;

        if(!this || !this.metadata) {
            console.warn('A new instance of metadata has been detected, therefore a new context will be created');
        }

        // allows all viewmodels created in the same instane of metadata
        // to share context (as long as createViewModels is called correctly)
        if (this && this.metadata) {
            metadataContext = this;
        } else {
            metadataContext = {
                metadata: metadata
            }
            // remembering to call these functions from this is bad
            // if parent forgot to do it, then this will be undefined, which is messy
            // better for the parent to explicitly bind the func from the sandbox
            
            //metadataContext.createViewModels = createViewModels.bind(metadataContext);
            //metadataContext.createViewModel = createViewModel.bind(metadataContext);
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

    function templateViewModel(node) {
        // aside from mapping child nodes, no viewmodel is necessary for a template
        // templates pass the node along, as well as mappedChildNodes for compatibility
        // this way we can write templates and bindings without having to always write a new vm
        var mappedChildNodes = createViewModels(node.children || []);

        return core.object.merge(node, {
            mappedChildNodes: mappedChildNodes
        });
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
                metadataTemplate = createTemplate(metadata).template,
                prevMetadata = ko.utils.domData.get(element, 'metadata');

            if (prevMetadata) {
                prevMetadata = Array.isArray(prevMetadata) ? prevMetadata : [prevMetadata];
                dispose(prevMetadata);
            }

            ko.utils.domData.set(element,'metadata', metadataTemplate.data);

            setTimeout(function () {
                ko.bindingHandlers.template.update(
                    element,
                    function () {
                        return metadataTemplate;
                    },
                    allBindings,
                    viewModel,
                    bindingContext
                );
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

