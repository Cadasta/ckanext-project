
  var app = angular.module("app");

  app.controller("overviewCtrl", ['$scope', '$state', '$stateParams','$location', 'dataService','paramService', function($scope, $state, $stateParams, $location, dataService, paramService) {

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

          var layer;

          // If there are any parcels, load the map and zoom to parcel
          if($scope.overviewData.parcels && $scope.overviewData.parcels.features[0].geometry) {
              layer = L.geoJson($scope.overviewData.parcels);
              layer.addTo(map);

          }

          if($stateParams.usermod){
              map.setView([lat,lng],zoom);
          } else {
              map.fitBounds(layer.getBounds());
          }

      },function(err){
          $scope.overviewData = "Server Error";
      });




  }]);

