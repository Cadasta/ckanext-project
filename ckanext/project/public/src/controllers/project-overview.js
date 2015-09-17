
  var app = angular.module("app");

  app.controller("overviewCtrl", ['$scope', '$state', '$stateParams','$location', 'dataService','paramService', 'utilityService', function($scope, $state, $stateParams, $location, dataService, paramService, utilityService) {

      if($state.current.name !== "tabs.overview") {
          return;
      }

      var mapStr = $stateParams.map;

      // parse map query param
      var mapArr = mapStr.substring(1,mapStr.length-1).split(',');

      var lat = mapArr[0];
      var lng = mapArr[1];
      var zoom = mapArr[2];

      // setup map
      var map = L.map('overviewMap', {scrollWheelZoom:false});

      // After each pan or zoom
      map.on('moveend', function(){

          var center = map.getCenter();
          var zoom = map.getZoom();

          var param  = '('+[center.lat, center.lng, zoom].join(',')+ ')';
          $stateParams.map = param;
          paramService.setStateParam($state.current.name, 'map', param);
          $state.go($state.current.name, $stateParams, {notify:false});
          //$location.search('map', param);
          //$scope.$emit('$locationChangeSuccess');

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

          //reformat date created of resources
          $scope.overviewData.features[0].properties.resources.forEach(function(resource) {
              resource.properties.time_created = utilityService.formatDate(resource.properties.time_created);
          });

          //var layer;
          //
          //// If there are any parcels, load the map and zoom to parcel
          //if($scope.overviewData.features[0].geometry) {
          //    layer = L.geoJson($scope.overviewData.features[0]);
          //    layer.addTo(map);
          //
          //} else if ( $scope.overviewData.features[0].properties.parcels && $scope.overviewData.features[0].properties.parcels[0].geometry) {
          //    layer = L.geoJson($scope.overviewData.features[0].properties.parcels);
          //    layer.addTo(map);
          //
          //}

          //if($stateParams.usermod){
          //    map.setView([lat,lng],zoom);
          //} else {
          //    map.fitBounds(layer.getBounds());
          //}



      },function(err){
          $scope.overviewData = "Server Error";
      });




  }]);

