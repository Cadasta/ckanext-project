
  var app = angular.module("app");


  app.controller("parcelsCtrl", ['$scope', '$state', '$stateParams','dataService', function($scope, $state, $stateParams, dataService){

      if($state.current.name !== "tabs.parcels.parcellist") {
          return;
      }

      $scope.parcels = [];

      var promise = parcelService.parcelsGet();

      promise.then(function(response){

          $scope.parcels = response;

      },function(err){
          $scope.overviewData = "Server Error";
      });

  }]);
