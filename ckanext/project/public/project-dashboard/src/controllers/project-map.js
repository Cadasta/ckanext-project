
  var app = angular.module("app");

  app.controller("projectMapCtrl", ['$scope', '$state', '$stateParams','$location', 'dataService','paramService', 'utilityService','$rootScope', 'ckanId', 'cadastaProject',
      function($scope, $state, $stateParams, $location, dataService, paramService, utilityService,$rootScope, ckanId, cadastaProject) {

      var mapStr = $stateParams.map;

      $rootScope.$broadcast('tab-change', {tab: 'Map'}); // notify breadcrumbs of tab on page load

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
      var promise = dataService.overviewGet(ckanId, cadastaProject.id);

      promise.then(function(response){

          $scope.overviewData = response;

          var layer;

          var parcelStyle = {
              "color": "#256c97",
              "weight": 2,
              fillOpacity:.7
          };

          var ExtentStyle = {
              "color": "#256c97",
              "weight":1,
              "opacity": 0.2
          };


          // If there is a project extent add it to the map
          if($scope.overviewData.features[0].geometry) {
              layer = L.geoJson($scope.overviewData.features[0], {style:ExtentStyle});
              layer.addTo(map);

          }

          // If there are parcels add them to the map
          if ( $scope.overviewData.features[0].properties.parcels ) {


              $scope.overviewData.features[0].properties.parcels.forEach(function(parcel) {
                  var parcelToAdd = L.geoJson(parcel.geometry, {style:parcelStyle});
                  parcelToAdd.addTo(map);
              });

          }

          //zoom to project extent
          if(layer === undefined){
              map.setView([lat,lng],zoom);
          } else {
              map.fitBounds(layer.getBounds());
          }



      },function(err){
          $scope.overviewData = "Server Error";
      });




  }]);

