define([
    'scalejs.core'
], function (
    core
    ) {
        'use strict';
        function functionRegistry() {
            var dictionary = {};

            // will set the value on an existing observable

            function register(key, func) {
                dictionary[key] = func;
            }

            function get(key) {
                var func = dictionary[key];
                if (func) {
                    return func;
                }
                console.error('function ', key, 'not found');
            }
            function remove(key) {
                if (dictionary[key]) {
                    delete dictionary[key];
                }
            }

            return {
                register: register,
                get: get,
                remove: remove,
                dictionary: dictionary
            };
        }
        // create instance
        var registry = functionRegistry();
        // register in sandbox/core
        //core.registerExtension({
        //    functionRegistry: registry
        //});
        //return for require
        return registry;
    });

