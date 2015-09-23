
  var app = angular.module("app");

  app.controller("projectMapCtrl", ['$scope', '$state', '$stateParams','$location', 'dataService','paramService', 'utilityService', function($scope, $state, $stateParams, $location, dataService, paramService, utilityService) {

      var mapStr = $stateParams.map;

      // parse map query param
      var mapArr = mapStr.substring(1,mapStr.length-1).split(',');

      var lat = mapArr[0];
      var lng = mapArr[1];
      var zoom = mapArr[2];

      // setup map
      var map = L.map('projectBigMap', {scrollWheelZoom:false});

      // After each pan or zoom
      map.on('moveend', function(){

          if($state.current.name !== 'tabs.map') {
              return;
          }

          var center = map.getCenter();
          var zoom = map.getZoom();
          var param  = '('+[center.lat, center.lng, zoom].join(',')+ ')';
          $stateParams.map = param;
          paramService.setStateParam($state.current.name, 'map', param);
          $state.go($state.current.name, $stateParams, {notify:false});
      });

      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
          attribution: '',
          maxZoom: 18,
          id: 'spatialdev.map-rpljvvub',
          accessToken: 'pk.eyJ1Ijoic3BhdGlhbGRldiIsImEiOiJKRGYyYUlRIn0.PuYcbpuC38WO6D1r7xdMdA#3/0.00/0.00'
      }).addTo(map);

      // Get overview data
      var promise = dataService.overviewGet();

      promise.then(function(response){

          $scope.overviewData = response;
          $scope.overviewData.activityList = response.features[0].properties.project_activity;

          //reformat date created of resources
          $scope.overviewData.features[0].properties.project_resources.forEach(function(resource) {
              resource.properties.time_created = utilityService.formatDate(resource.properties.time_created);
          });

          //reformat date created of activity list
          $scope.overviewData.features[0].properties.project_activity.forEach(function(activity) {
              activity.properties.time_created = utilityService.formatDate(activity.properties.time_created);
          });


          var layer;

          // If there is a project geom load map and zoom to it; else zoome to parcels
          if($scope.overviewData.features[0].geometry) {
              layer = L.geoJson($scope.overviewData.features[0]);
              layer.addTo(map);

          } else if ( $scope.overviewData.features[0].properties.parcels && $scope.overviewData.features[0].properties.parcels[0].geometry) {
              layer = L.geoJson($scope.overviewData.features[0].properties.parcels);
              layer.addTo(map);

          }

          if(layer === undefined){
              map.setView([lat,lng],zoom);
          } else {
              map.fitBounds(layer.getBounds());
          }



      },function(err){
          $scope.overviewData = "Server Error";
      });




  }]);

