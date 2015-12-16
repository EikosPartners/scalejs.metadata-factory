/*global define, core, _, ko */
define([
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
