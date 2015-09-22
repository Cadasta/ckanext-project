var app = angular.module("app");


app.controller("activityCtrl", ['$scope', '$state', '$stateParams','dataService', 'utilityService', function($scope, $state, $stateParams, dataService, utilityService){

    if($state.current.name !== "tabs.activity") {
        return;
    }

    var promise = dataService.getAllActivities();

    promise.then(function(response){
        $scope.allActivities = response;

        //reformat date created of activity list
        $scope.allActivities.features.forEach(function(activity) {
            activity.properties.time_created = utilityService.formatDate(activity.properties.time_created);
        });


    },function(err){
        $scope.overviewData = "Server Error";
    });

}]);
