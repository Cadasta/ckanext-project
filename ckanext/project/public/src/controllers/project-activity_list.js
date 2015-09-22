var app = angular.module("app");


app.controller("activityCtrl", ['$scope', '$state', '$stateParams','dataService', function($scope, $state, $stateParams, dataService){

    if($state.current.name !== "tabs.activity") {
        return;
    }

    $scope.parcels = [];

    var promise = dataService.getAllActivities();

    promise.then(function(response){

        $scope.overviewData.allActivities = response;

    },function(err){
        $scope.overviewData = "Server Error";
    });

}]);
