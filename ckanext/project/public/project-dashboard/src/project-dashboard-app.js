
var app = angular.module("app",
    [ 'ct.ui.router.extras', 'params.manager', 'app.config', 'ngMaterial', 'angularFileUpload']);

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

  app.config(function ($stateProvider, $urlRouterProvider) {

    var states = [];

    // Parent State
    states.push({
      name: 'tabs',
      url: '/',
      views: {
        'breadcrumbs@': { controller:'breadcrumbsCtrl', templateUrl: '/project-dashboard/src/partials/breadcrumbs.html' },
        'projectHeader@': { controller:'headerCtrl', templateUrl: '/project-dashboard/src/partials/projectHeader.html' },
        'tabs@': {  controller:'tabsCtrl', templateUrl: '/project-dashboard/src/partials/tabs.html' }
      },
      resolve: {
        ckanId: function ($window) {

          return $window.location.pathname.split('/')[2];
        },
        cadastaProject: function ($q, $window, dataService) {

          var ckanId = $window.location.pathname.split('/')[2];

          var deferred = $q.defer();

          var promise = dataService.getCadastaProject(ckanId);

          promise.then(function(response){
            deferred.resolve(response);
          },function(err){
            console.error(err);
            deferred.reject(err);

          });

          return deferred.promise;

        }
      }});

    // Child State
    states.push({
      name: 'tabs.overview',
      url: 'overview?map',
      views: {
        'overviewtab': {controller: 'overviewCtrl', templateUrl: '/project-dashboard/src/partials/overview.html'}
      },
      paramsMap:[{key:'map', defaultValue: '(0,0,0)'}],

      onEnter: function($state, $stateParams, mapUtilityService){

        $stateParams.map = mapUtilityService.validateMapParam($stateParams.map);
      },
      reloadOnSearch: false,
      deepStateRedirect: dsrCb,
      sticky: true
    });

    // Child State
    states.push({
      name: 'tabs.parcels',
      url: 'parcels',
      views: {
        'parcelstab': {  templateUrl: '/project-dashboard/src/partials/parcels.html' }
      },
      deepStateRedirect: { default: "tabs.parcels.parcellist" },
      sticky: true
    });

    // Grandchild State
    states.push({
      name: 'tabs.parcels.parcellist',
      url: '/list',
      views: {
        'parcelslist': {
          controller: 'parcelsCtrl',
          templateUrl: '/project-dashboard/src/partials/parcelList.html', }
      },
      sticky:true,
      deepStateRedirect: true
    });

    // Grandchild State
    states.push({
      name: 'tabs.parcels.parcel',
      url: '/:id?map',
      views: {
        'parcel': {
          controller: 'parcelCtrl',
          templateUrl: '/project-dashboard/src/partials/parcel.html' }
      },
      onEnter: function($state, $stateParams, mapUtilityService){

        $stateParams.map = mapUtilityService.validateMapParam($stateParams.map);
      },
      reloadOnSearch: false,
      deepStateRedirect: dsrCb,
      paramsMap:[{key:'id'}, {key:'map', defaultValue: '(0,0,0)'}],
      sticky:true,
      resolve: {
        ckanId: function ($window) {

          return $window.location.pathname.split('/')[2];
        },
        cadastaProject: function ($q, $window, dataService) {

          var ckanId = $window.location.pathname.split('/')[2];

          var deferred = $q.defer();

          var promise = dataService.getCadastaProject(ckanId);

          promise.then(function(response){
            deferred.resolve(response);
          },function(err){
            console.error(err);
            deferred.reject(err);

          });

          return deferred.promise;

        }
      }


    });

    // Child State
    states.push({
      name: 'tabs.map',
      url: 'map?map',
      views: {
          'maptab': { controller: 'projectMapCtrl', templateUrl: '/project-dashboard/src/partials/map.html' }
      },
      paramsMap:[{key:'map', defaultValue: '(0,0,0)'}],
      onEnter: function($state, $stateParams, mapUtilityService){

        $stateParams.map = mapUtilityService.validateMapParam($stateParams.map);

      },
      reloadOnSearch: false,
      deepStateRedirect: dsrCb,
      sticky: true
    });


    // Child State for activity list
    states.push({
      name: 'tabs.activity',
      url: 'activity',
      views: {
        'activitytab': {  controller:'activityCtrl', templateUrl: '/project-dashboard/src/partials/project_activity.html' }
      },
      deepStateRedirect: dsrCb,
      sticky: true
    });


    // Child State for resource list
    states.push({
      name: 'tabs.resources',
      url: 'resources',
      views: {
        'resourcetab': { controller:'resourceCtrl', templateUrl: '/project-dashboard/src/partials/project_resources.html' }
      },
      deepStateRedirect: dsrCb,
      sticky: true
    });

    // Child State for activity list
    states.push({
      name: 'tabs.fieldData',
      url: 'fieldData',
      views: {
        'fieldDatatab': { controller:'fieldDataCtrl', templateUrl: '/project-dashboard/src/partials/fieldData.html' }
      },
      deepStateRedirect: dsrCb,
      sticky: true
    });




    // Add the states
    angular.forEach(states, function(state) {
      $stateProvider.state(state);

    });

    $urlRouterProvider.otherwise('/overview?map=(0,0,1)');

  });

  app.run(function($state, paramService){

    var states = $state.get();

    states.forEach(function(state){

      if(!state.abstract && state.hasOwnProperty('paramsMap')) {
        paramService.setState(state);
      }
    });

  });

