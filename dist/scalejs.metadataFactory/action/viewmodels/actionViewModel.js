'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = actionViewModel;

var _scalejsCore = require('scalejs!core');

var _scalejsCore2 = _interopRequireDefault(_scalejsCore);

var _knockout = require('knockout');

var _knockout2 = _interopRequireDefault(_knockout);

var _action = require('text!scalejs.metadataFactory/action/views/action.html');

var _action2 = _interopRequireDefault(_action);

var _actionBindings = require('scalejs.metadataFactory/action/bindings/actionBindings.js');

var _actionBindings2 = _interopRequireDefault(_actionBindings);

require('scalejs.reactive');

require('scalejs.mvvm');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*global define, ko, core, view, binding */


var merge = _scalejsCore2.default.object.merge,
    notify = _scalejsCore2.default.reactive.messageBus.notify,
    observable = _knockout2.default.observable,
    unwrap = _knockout2.default.unwrap,
    has = _scalejsCore2.default.object.has;

_scalejsCore2.default.mvvm.registerTemplates(_action2.default);
_scalejsCore2.default.mvvm.registerBindings(_actionBindings2.default);

function notifyAction(options) {
    notify(unwrap(options.target), options.params);
}

function actionViewModel(node) {
    var registeredActions = _scalejsCore2.default.metadataFactory.getRegisteredActions();
    var text = node.text || node.options.text,
        createViewModel = _scalejsCore2.default.metadataFactory.createViewModel.bind(this),
        validate = node.validate,
        options = node.options || {},
        actionType = node.actionType,
        actions = {
        notify: notifyAction
    },
        mergedActions = _scalejsCore2.default.object.extend(actions, registeredActions),
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
                successCallback: function successCallback() {
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
            items: options.items.map(function (v) {
                if (typeof v === 'string') {
                    return createViewModel({
                        type: 'action',
                        text: v
                    });
                }
                return createViewModel(v);
            })
        };
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