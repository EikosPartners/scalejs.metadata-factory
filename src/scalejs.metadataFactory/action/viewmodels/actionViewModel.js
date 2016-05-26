/*global define, ko, core, view, binding */
import core from 'scalejs.core';
import ko from 'knockout';
import view from 'html!scalejs.metadataFactory/action/views/action.html';
import binding from './scalejs.metadataFactory/action/bindings/actionBindings.js';
import 'scalejs.reactive';
import 'scalejs.mvvm';


var merge = core.object.merge,
    notify = core.reactive.messageBus.notify,
    observable = ko.observable,
    unwrap = ko.unwrap,
    has = core.object.has;

core.mvvm.registerTemplates(view);
core.mvvm.registerBindings(binding);

function notifyAction(options) {
    notify(unwrap(options.target), options.params);
}

export default function actionViewModel(node) {
    var registeredActions = core.metadataFactory.getRegisteredActions();
    var text = node.text || node.options.text,
        createViewModel = core.metadataFactory.createViewModel.bind(this),
        validate = node.validate,
        options = node.options || {},
        actionType = node.actionType,
        actions = {
            notify: notifyAction
        },
        mergedActions = core.object.extend(actions, registeredActions),
        actionFunc = mergedActions[actionType] || null,
        isShown = observable(true),
        disabled = observable(has(options.disabled) ? options.disabled : false),
        context = this;

    if (actionFunc) {
        actionFunc = actionFunc.bind(this);
    }

    function action(args) {
        if (!actionFunc) {
            console.error('actions[actionType] is not defined', node);
            return;
        }

        if (validate) {
            notify(validate, {
                successCallback: function() {
                    actionFunc(options, args);
                }
            });
        } else {
            actionFunc(options, args);
        }
    }

    if (actionType === 'dropdown') {
        options.dropdown = {
            showDropdown: observable(false),
            items: options.items.map(function(v) {
                if (typeof v === 'string') {
                    return createViewModel({
                        type: 'action',
                        text: v
                    });
                }
                return createViewModel(v);
            })
        }
    }

    if (node.immediate) {
        action();
        return;
    }

    return merge(node, {
        isShown: isShown,
        action: action,
        text: text,
        actionType: actionType,
        options: options,
        disabled: disabled,
        context: context
    });

};
