
  var app = angular.module("app",
    [ 'ct.ui.router.extras', 'params.manager', 'app.config', 'ngMaterial']);

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

        if($stateParams.map === undefined) {
          $stateParams.map = '(0,0,0)';
        } else  if($stateParams.map.length < 7 || $stateParams.map[0] !== '(' || $stateParams.map[$stateParams.map.length-1] !== ')') {
          console.error('Invalid map param:', $stateParams.map, ', resetting to (0,0,0)');
          $stateParams.map = '(0,0,0)';
        } else {
          // parse map query param
          var mapStr = $stateParams.map;
          var mapArr = $stateParams.map.substring(1,mapStr.length-1).split(',');
          var lat = Number(mapArr[0]);
          var lng = Number(mapArr[1]);
          var zoom = Number(mapArr[2]);

          if(isNaN(lat) || isNaN(lng) || isNaN(zoom)) {
            console.warn('Invalid map param:', $stateParams.map, ', resetting to (0,0,0)');
            $stateParams.map = '(0,0,0)';
          } else {

            if(lat > 90 || lat < 0) {
              console.warn('Invalid latitude param:', $stateParams.map + ', resetting latitude to 0.');
              lat = 0;
            }
            if (lng >180 || lng < -180) {
              console.warn('Invalid longitude param:', $stateParams.map + ', resetting longitude to 0.');
              lng = 0
            }
            if(zoom < 0 ) {
              console.warn('Invalid zoom param:', $stateParams.map + ', resetting zoom to 0.');
              zoom = 0;
            }

            $stateParams.map = [lat,lng,zoom].join(',');
          }
        }
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
      url: '/list',
      views: {
        'parcelslist': {
          controller: 'parcelsCtrl',
          templateUrl: '../src/partials/parcelList.html', }
      },
      sticky:true,
      deepStateRedirect: true//dsrCb
    });

    // Grandchild State
    states.push({
      name: 'tabs.parcels.parcel',
      url: '/:id?map',
      views: {
        'parcel': {
          controller: 'parcelCtrl',
          templateUrl: '../src/partials/parcel.html' }
      },
      onEnter: function($state, $stateParams, paramService){

        if($stateParams.map === undefined) {
          $stateParams.map = '(0,0,0)';
        } else  if($stateParams.map.length < 7 || $stateParams.map[0] !== '(' || $stateParams.map[$stateParams.map.length-1] !== ')') {
          console.error('Invalid map param:', $stateParams.map, ', resetting to (0,0,0)');
          $stateParams.map = '(0,0,0)';
        } else {
          // parse map query param
          var mapStr = $stateParams.map;
          var mapArr = $stateParams.map.substring(1,mapStr.length-1).split(',');
          var lat = Number(mapArr[0]);
          var lng = Number(mapArr[1]);
          var zoom = Number(mapArr[2]);

          if(isNaN(lat) || isNaN(lng) || isNaN(zoom)) {
            console.warn('Invalid map param:', $stateParams.map, ', resetting to (0,0,0)');
            $stateParams.map = '(0,0,0)';
          } else {

            if(lat > 90 || lat < 0) {
              console.warn('Invalid latitude param:', $stateParams.map + ', resetting latitude to 0.');
              lat = 0;
            }
            if (lng >180 || lng < -180) {
              console.warn('Invalid longitude param:', $stateParams.map + ', resetting longitude to 0.');
              lng = 0
            }
            if(zoom < 0 ) {
              console.warn('Invalid zoom param:', $stateParams.map + ', resetting zoom to 0.');
              zoom = 0;
            }

            $stateParams.map = [lat,lng,zoom].join(',');
          }
        }
      },
      deepStateRedirect: dsrCb,
      paramsMap:[{key:'id'}, {key:'map', defaultValue: '(0,0,0)'}],
      sticky:true

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


    // Child State for activity list
    states.push({
      name: 'tabs.activity',
      url: 'activity',
      views: {
        'activitytab': {  templateUrl: '../src/partials/project_activity.html' }
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
