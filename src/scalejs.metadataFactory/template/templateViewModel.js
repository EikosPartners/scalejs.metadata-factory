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

   return function templateViewModel (node) {
        var observable = ko.observable,
            merge = core.object.merge,
            data = observable(node.data || {}),
            context = node.options && node.options.createContext ? { metadata: [], data: data } : this,
            createAction = core.utils.createAction.bind(context),
            createViewModel = core.metadataFactory.createViewModel.bind(this), // passes context
            createViewModels = core.metadataFactory.createViewModels.bind(context), // passes context
            // properties
            isShown = observable(node.visible !== false),
            //visible = observable(),
            actionNode = _.cloneDeep(node.action),
            action,
            mappedChildNodes;

        function getValue(key) {
            return (data() || {})[key];
        }

        mappedChildNodes = createViewModels(node.children || []);

        if (actionNode) {
            action = createAction(actionNode);
        } else {
            action = function () {};
        }
        
        if(node.dataSourceEndpoint){
            
            // create a callback object that the ajaxAction knows how to use.
            // this is the alternative to the lously coupled nextactions[] || error actions. 
            var callback = { callback: function(err, results){
                if(err) {
                    console.log('ajax request error',err);
                    return;
                }
                data(results);
            }}
            createAction(node.dataSourceEndpoint).action(callback);
        }

        // // visible binding using expressions and context's getValue func
        // if (has(node.visible)) {
        //     console.log('visible in template', node.visible);
        //     is(node.visible, 'boolean') ? visible(node.visible) :  visible = computed(function() {

        //         return userService.isAllowed(node.visible);
        //     });

        //     // isShown is an observable that can be updated by rules so when visible changes so must isShown
        //     var isVisible = visible();
        //     isShown(isVisible);
        //     visible.subscribe(isShown);
        // }
        return merge(node, {
            mappedChildNodes: mappedChildNodes,
            action: action,
            data: data,
            isShown: isShown,
            context: this
        });
    }
});
