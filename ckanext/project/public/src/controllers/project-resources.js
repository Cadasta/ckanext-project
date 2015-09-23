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


    $scope.resource_types = [
        {
            type: 'all',
            label: 'All Resources'
        },
        {
            type: 'project',
            label: 'Project Resources'
        },
        {
            type: 'parcel',
            label: 'Parcel Resources'
        },
        {
            type: 'party',
            label: 'Party Resources'
        },
        {
            type: 'relationship',
            label: 'Relationship Resources'
        }
    ];

    $scope.sort_by = [
        {
            type: 'name',
            label: 'Name'
        },
        {
            type: 'time_created',
            label: 'Date'
        }
    ];


}]);

