
  var app = angular.module("app");

  app.controller("parcelsCtrl", ['$scope', '$state', '$stateParams','parcelService','$rootScope', function($scope, $state, $stateParams, parcelService,$rootScope){

      if($state.current.name !== "tabs.parcels.parcellist") {
          return;
      }

      $rootScope.$broadcast('tab-change', {tab:'Parcels'});

      $scope.parcels = [];

      var promise = parcelService.parcelsGet();

      promise.then(function(response){

          $scope.parcels = response;

      },function(err){
          $scope.overviewData = "Server Error";
      });

  }]);