/*global define, actionViewModel, sandbox,core,  avm  */
import core from 'scalejs.core';
import avm from './viewmodels/actionViewModel';
import 'scalejs.mvvm';

var actionViewModel = avm,
    registeredActions = {};

function getRegisteredActions() {
    return registeredActions;
}

function registerActions(actions) {
    core.object.extend(registeredActions, actions);
}

export default {
    action: actionViewModel,
    registerActions: registerActions,
    getRegisteredActions: getRegisteredActions
};