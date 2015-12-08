/*global define, ko, core, view, binding */
define([
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
