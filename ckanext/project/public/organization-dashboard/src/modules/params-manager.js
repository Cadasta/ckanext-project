var OrganizationDashboardApp = angular.module("params.manager", []);

OrganizationDashboardApp.service("paramService", [ function () {

    var service =  {};

    var states = {};

    service.setState = function(state){


        states[state.name] = {};

        state.paramsMap.forEach(function(par){
            states[state.name][par.key] = par.defaultValue;
        })

    };

    service.getState = function(id){

        return states[id];
    };

    service.setStateParam = function(name, key, value){

        states[name][key] = value;

    };

    return service;
}]);