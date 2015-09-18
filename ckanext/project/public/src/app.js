
  var app = angular.module("app",
    [ 'ct.ui.router.extras', 'params.manager']);

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
        'breadcrumbs@': { controller:'breadcrumbsCtrl', templateUrl: '../src/partials/breadcrumbs.html' },
        'projectHeader@': { template: 'Project Header here...' },
        'tabs@': {  controller:'tabsCtrl', templateUrl: '../src/partials/tabs.html' }
      }});

    // Child State
    states.push({
      name: 'tabs.overview',
      url: 'overview?map',
      views: {
        'overviewtab': {controller: 'overviewCtrl', templateUrl: '../src/partials/overview.html'}
      },
      paramsMap:[{key:'map', defaultValue: '(0,0,0)'}],

      onEnter: function($state, $stateParams, paramService){

        var stateState = paramService.getState(this.name);

        angular.forEach($stateParams, function(value, key){

          $stateParams[key] = stateState[key];

        });


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
        'parcelstab': {  templateUrl: '../src/partials/parcels.html' }
      },
      deepStateRedirect: { default: "tabs.parcels.parcellist" },
      sticky: true
    });

    // Grandchild State
    states.push({
      name: 'tabs.parcels.parcellist',
      deepStateRedirect: dsrCb,
      url: '/list',
      controller: 'parcelsCtrl',
      templateUrl: '../src/partials/parcelList.html'
    });

    // Grandchild State
    states.push({
      name: 'tabs.parcels.parcel',
      url: '/:id',
      controller: 'parcelCtrl',
      templateUrl: '../src/partials/parcel.html',
      deepStateRedirect: dsrCb,
      paramsMap:[{key:'id'}],

      onEnter: function($state, $stateParams, paramService){

        var stateState = paramService.getState(this.name);

        angular.forEach($stateParams, function(value, key){

          $stateParams[key] = stateState[key];

        });


      }
    });

    // Child State
    states.push({
      name: 'tabs.map',
      url: 'map',
      views: {
          'maptab': {  templateUrl: '../src/partials/map.html' }
      },
      deepStateRedirect: dsrCb,
      sticky: true });

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