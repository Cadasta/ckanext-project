
var OrganizationDashboardApp = angular.module("OrganizationDashboardApp", [ 'ct.ui.router.extras', 'params.manager', 'app.config', 'env.config', 'ngMaterial']);
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
            },



            // Get the current user's role on currently view project
            userRole: function($q, $window, userOrgService) {

                // Get CKAN project name from URL
                var ckanName = $window.location.pathname.split('/')[2];

                var deferred = $q.defer();

                //  Query the CKAN API to get all organizations (and child projects) that this user is a member to
                var promise = userOrgService.getUserRole();

                promise.then(function (response) {

                    var role = "public";

                    //  Loop thru orgs
                    response.forEach(function(org) {

                        //  If the project names match, grab the role this user plays in the current org.
                        if (org.organization.name === ckanName) {
                            role = org.role;
                        }
                    });

                    deferred.resolve(role);
                }, function (err) {
                    console.error(err);
                    deferred.reject(err);

                });
                return deferred.promise;
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

