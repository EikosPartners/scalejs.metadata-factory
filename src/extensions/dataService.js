define([
    'scalejs!core',
    'scalejs.ajax-jquery'
], function (
    core
) {
    'use strict';

    var ajaxGet = core.ajax.get,
        ajaxSend = core.ajax.sendJson,
        url = window.service || '/';
            // use apply when the options are specified in the json
    function ajax(request, callback){
        request.options = request.options || {};        
        if (!request.options.type) {
            request.options.type = 'GET';
        }        
        // let the options determine the get/send
        if(request.options.type.toUpperCase() === 'GET'){
            getData(request, callback);
        } else {
            sendData(request, callback);
        }
    }

    function sendData( request, callback ) {
        var _url = request.url || url;
        //TODO: remove all url's from json.
        _url  = '/'; // we need to remove all url's from json.
                     // then remove this line
        if(!request.options){
            request.options = {}
        }

        ajaxSend(_url + request.uri, request.data, request.options)
        .subscribe(function (data) {
            callback(null, data);
        }, function (error) {
            console.error('Error happened while proccessing request',
                request, error);
            callback({ error: 'System error' });
        });
    }

    function getData( request, callback ) {
        console.log('REQUEST URI', request.uri);
        var _url = request.url || url;
        //TODO: remove all url's from json.
        _url  = '/'; // we need to remove all url's from json.
                     // then remove this line

        if(!request.options){
            request.options = {}
        }
        ajaxGet(_url + request.uri, request.data,request.options)
        .subscribe(function (data) {
            callback(null, data);
        }, function (error) {
            console.error('Error happened while proccessing request', request, error);
            callback({ error: 'System error' });
        });
    }

    function getMany( args , callback ) {
        core.reactive.Observable.forkJoin(
            args.map(function ( request ) {
                if (typeof request === 'string') {
                    request = { uri: request };
                }

                return ajaxGet(url + request.uri,
                    request.data, request.options);
            })
        )
        .subscribe(function (data) {
            callback(null, data);
        }, function (error) {
            console.error('Error happened while processing request',
                args, error);
            callback({ error: 'System error' });
        });
    }

    return {
        get: getData,
        getMany:getMany,
        send: sendData,
        ajax: ajax // can be used with get or send
    };
});

