
  var app = angular.module("app");

  app.controller("overviewCtrl", ['$scope', '$state', '$stateParams','$location', 'dataService','paramService', 'utilityService', '$rootScope','Upload', 'onaService',
      function($scope, $state, $stateParams, $location, dataService, paramService, utilityService, $rootScope,Upload, onaService) {

      var mapStr = $stateParams.map;

      $rootScope.$broadcast('tab-change', {tab: 'Overview'}); // notify breadcrumbs of tab on page load

      // parse map query param
      var mapArr = mapStr.substring(1,mapStr.length-1).split(',');

      var lat = mapArr[0];
      var lng = mapArr[1];
      var zoom = mapArr[2];


      $scope.submit = function() {
          if (form.file.$valid && $scope.file && !$scope.file.$error) {
              //$scope.upload($scope.file);

              $scope.upload($scope.file);

          }
      };

      // upload on file select or drop
      $scope.upload = function (file) {
          Upload.json({
              url: 'upload/url',
              data: {file: file, 'username': $scope.username}
          }).progress(function (evt) {
              var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
              console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
          }).success(function (data, status, headers, config) {
              console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
          }).error(function (data, status, headers, config) {
              console.log('error status: ' + status);
          })
      };

      // setup map
      var map = L.map('overviewMap', {scrollWheelZoom:false});

      // After each pan or zoom
      map.on('moveend', function(){

          if($state.current.name !== 'tabs.overview') {
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

          //todo upate with data from ckan
          $scope.overviewData.description = "This project is working with locals in Bolivia.  The community includes 10,000 people of which 149 have official land ownership documents."


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

