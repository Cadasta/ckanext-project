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


    // update resource type on selection
    $scope.filterResourceType = function (type){
        $scope.ResourceTypeModel = type;
    };

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


// custom tenure type filter
app.filter('resourceType', function () {
    return function(inputs,filter_type) {
        var output = [];
        switch(filter_type){
            case 'project':
            case 'parcel':
            case 'party':
            case 'relationship':
                //check if array contains filter selection
                inputs.forEach(function (input) {
                    if (filter_type.indexOf(input.properties.type) !== -1)
                        output.push(input);
                });
                return output;
                break;
            case 'time_created':
                // create unique copy of array
                var arr = inputs.slice();
                // sort by date DESC
                arr.sort(function(a,b){
                    var a_date = new Date(a.properties.time_created);
                    var b_date = new Date(b.properties.time_created);
                    return   b_date - a_date;
                });
                return arr;
                break;
            case 'id':
                // sort by ASC
                var arr = inputs.slice();
                arr.sort(function(a,b){
                    return a.properties.description - b.properties.description;
                });
                return arr;
                break;
            default:
                return inputs;
        }
    };
});