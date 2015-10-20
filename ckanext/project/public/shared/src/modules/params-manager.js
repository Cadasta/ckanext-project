var app = angular.module("params.manager", []);

app.service("paramService", [ function () {

    var service =  {};

    var states = {};

    service.setState = function(state){


        states[state.name] = {};

        state.paramsMap.forEach(function(par){
            states[state.name][par.key] = par.defaultValue;
        })

    };

    service.getState = function(name){

        return states[name];
    };

    service.setStateParam = function(name, key, value){

        states[name][key] = value;

    };

    return service;
}]);