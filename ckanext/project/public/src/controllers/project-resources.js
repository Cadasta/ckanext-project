var app = angular.module("app");


app.controller("resourceCtrl", ['$scope', '$state', '$stateParams','dataService', 'utilityService', function($scope, $state, $stateParams, dataService, utilityService){

    if($state.current.name !== "tabs.resources") {
        return;
    }

    var promise = dataService.getAllResources();

    promise.then(function(response){
        $scope.allResources = response;

        //reformat date created of activity list
        $scope.allResources.features.forEach(function(resource) {
            resource.properties.time_created = utilityService.formatDate(resource.properties.time_created);
        });


    },function(err){
        $scope.overviewData = "Server Error";
    });

}]);
