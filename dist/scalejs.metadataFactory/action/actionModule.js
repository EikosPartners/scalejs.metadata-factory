'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _scalejsCore = require('scalejs!core');

var _scalejsCore2 = _interopRequireDefault(_scalejsCore);

var _actionViewModel = require('scalejs.metadataFactory/action/viewmodels/actionViewModel');

var _actionViewModel2 = _interopRequireDefault(_actionViewModel);

require('scalejs.mvvm');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var actionViewModel = _actionViewModel2.default,
    registeredActions = {}; /*global define, actionViewModel, sandbox,core,  avm  */


function getRegisteredActions() {
    return registeredActions;
}

function registerActions(actions) {
    _scalejsCore2.default.object.extend(registeredActions, actions);
}

exports.default = {
    action: actionViewModel,
    registerActions: registerActions,
    getRegisteredActions: getRegisteredActions
};