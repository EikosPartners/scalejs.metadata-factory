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
            '': defaultViewModel
        },
        useDefault = false;

    function createViewModel(node) {
        var mappedNode = viewModels[node.type] ? viewModels[node.type](node) : defaultViewModel(node);
        if (mappedNode) {
            mappedNode.type = mappedNode.type || node.type;
        }
        return mappedNode;
    }

    function createViewModels(metadata) {
        return metadata.map(createViewModel).filter(function (vm) { return has(vm); });
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
    
    function registerViewModels(newViewModels) {
        core.object.extend(viewModels, newViewModels);
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
            
            ko.bindingHandlers.template.update(
                element,
                function () {
                    var metadata = valueAccessor();                    
                    return createTemplate(ko.unwrap(metadata)).template;
                },
                allBindings,
                viewModel,
                bindingContext
            );
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

