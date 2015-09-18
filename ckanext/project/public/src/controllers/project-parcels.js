
  var app = angular.module("app");

  app.controller("parcelsCtrl", ['$scope', '$state', '$stateParams','parcelService', function($scope, $state, $stateParams, parcelService){

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