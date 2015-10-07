
var OrganizationDashboardApp = angular.module("OrganizationDashboardApp", [ 'ct.ui.router.extras', 'params.manager', 'app.config', 'ngMaterial']);
////

var dsrCb = function ($dsr$, paramService) {

    var stateParams = paramService.getState($dsr$.redirect.state);

    angular.forEach($dsr$.redirect.params, function(value, key){

        $dsr$.redirect.params[key] = stateParams[key];
    });

    var toStateParamsAllUndefined = true, redirectStateParamsAllUndefined = true;
    Object.keys($dsr$.to.params).forEach(function(par){

        if($dsr$.to.params[par]) {
            toStateParamsAllUndefined = false
        }

        if($dsr$.redirect.params[par]) {
            redirectStateParamsAllUndefined = false;
        }

    });

    return toStateParamsAllUndefined && !redirectStateParamsAllUndefined;
};



OrganizationDashboardApp.config(function ($stateProvider, $urlRouterProvider) {

    var states = [];

    // Parent State
    states.push({
        name: 'tabs',
        url: '/',
        views: {
            //'breadcrumbs@': { controller:'breadcrumbCtrl', templateUrl: '/organization-dashboard/src/partials/breadcrumbs.html' },
            //'projectHeader@': { controller:'orgHeaderCtrl', templateUrl: '/organization-dashboard/src/partials/orgHeader.html' },
            'tabs@': {  controller:'orgTabsCtrl', templateUrl: '/organization-dashboard/src/partials/tabs.html' }
        }});


    // Child State for activity list
    states.push({
        name: 'tabs.overview',
        url: 'overview',
        views: {
            'overviewtab': {  controller:'orgOverviewCtrl', templateUrl: '/organization-dashboard/src/partials/overview.html' }
        },
        deepStateRedirect: dsrCb,
        sticky: true,
        resolve: {
            ckanOrgId: function ($window) {
                return $window.location.pathname.split('/')[2];
            }
        }
    });



    // Add the states
    angular.forEach(states, function(state) {
        $stateProvider.state(state);

    });

    $urlRouterProvider.otherwise('/overview');

});

OrganizationDashboardApp.run(function($state, paramService){

    var states = $state.get();

    states.forEach(function(state){

        if(!state.abstract && state.hasOwnProperty('paramsMap')) {
            paramService.setState(state);
        }
    });

});

