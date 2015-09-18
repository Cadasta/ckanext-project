
  var app = angular.module("app");


  app.controller("parcelsCtrl", ['$scope', '$state', '$stateParams','dataService', function($scope, $state, $stateParams, dataService){

      if($state.current.name !== "tabs.parcels.parcellist") {
          return;
      }

      $scope.parcels = [];

      var promise = dataService.parcelsGet();

      promise.then(function(response){

          $scope.parcels = response.parcels;

      },function(err){
          $scope.overviewData = "Server Error";
      });

  }]);

  app.controller("parcelCtrl", ['$scope', '$state', '$stateParams','dataService', function($scope, $state, $stateParams, dataService){

      if($state.current.name !== "tabs.parcels.parcel") {
          return;
      }

      $scope.parcel = null;

      var promise = dataService.parcelGet();

      promise.then(function(response){

          $scope.parcel = response;

      },function(err){
          $scope.overviewData = "Server Error";
      });

  }]);