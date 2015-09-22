
  var app = angular.module("app");

  app.controller("parcelsCtrl", ['$scope', '$state', '$stateParams','parcelService', '$rootScope', 'utilityService', function($scope, $state, $stateParams, parcelService,$rootScope,utilityService){

      $rootScope.$broadcast('tab-change', {tab:'Parcels'});

      $scope.parcels = [];

      var promise = parcelService.parcelsGet();

      promise.then(function(response){

          //format dates
          response.forEach(function(val){val.properties.time_created= utilityService.formatDate(val.properties.time_created);})

          $scope.parcels = response;


      },function(err){
          $scope.overviewData = "Server Error";
      });

  }]);
