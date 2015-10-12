var app = angular.module("app");


app.controller("activityCtrl", ['$scope', '$state', '$stateParams','dataService', 'utilityService', '$rootScope', 'ckanId', 'cadastaProject',
    function($scope, $state, $stateParams, dataService, utilityService,$rootScope,ckanId, cadastaProject){
    if($state.current.name !== "tabs.activity") {
        return;
    }

    $rootScope.$broadcast('tab-change', {tab: 'Activity'}); // notify breadcrumbs of tab on page load

    var promise = dataService.getProjectActivities(cadastaProject.id);

    promise.then(function(response){
        $scope.allActivities = response;

        //reformat date created of activity list
        $scope.allActivities.features.forEach(function(activity) {
            activity.properties.time_created = utilityService.formatDate(activity.properties.time_created);
        });


    },function(err){
        $scope.overviewData = "Server Error";
    });

    // update activity type on selection
    $scope.filterActivityType = function (type){
        $scope.ActivityTypeModel = type;
    };

    $scope.activity_types = [
        {
            type: 'all',
            label: 'All Activities'
        },
        {
            type: 'parcel',
            label: 'Parcel Activity'
        },
        {
            type: 'party',
            label: 'Party Activity'
        },
        {
            type: 'relationship',
            label: 'Relationship Activity'
        }
    ];



}]);

// custom activity type filter
app.filter('activityType', function () {
    return function(inputs,filter_type) {
        var output = [];
        switch(filter_type){
            case 'parcel':
            case 'relationship':
            case 'party':
                //check if array contains filter selection
                inputs.forEach(function (input) {
                    if (filter_type.indexOf(input.properties.activity_type) !== -1)
                        output.push(input);
                });
                return output;
                break;

            default:
                return inputs;
        }
    };
});
