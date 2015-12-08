/*global define, actionViewModel, sandbox,core,  avm  */
define([
    'scalejs!core',
    'scalejs.metadataFactory/action/viewmodels/actionViewModel',
    'scalejs.mvvm'
], function (
    core,
    avm
) {
    'use strict';
    var actionViewModel = avm,  
        registeredActions = {};
    
    function getRegisteredActions()
    {
        return registeredActions;
    }

    function registerActions(actions)
    {
        core.object.extend(registeredActions, actions);
    }
     
    return {action:  actionViewModel,
            registerActions: registerActions,
            getRegisteredActions: getRegisteredActions};
});