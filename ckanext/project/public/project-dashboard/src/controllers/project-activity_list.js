var app = angular.module("app");


app.controller("activityCtrl", ['activityTypes','$scope', '$state', '$stateParams','dataService', 'utilityService', '$rootScope', 'ckanId', 'cadastaProject',
    function(activityTypes,$scope, $state, $stateParams, dataService, utilityService,$rootScope,ckanId, cadastaProject){
    if($state.current.name !== "tabs.activity") {
        return;
    }

    $rootScope.$broadcast('tab-change', {tab: 'Activity'}); // notify breadcrumbs of tab on page load

    function getActivities() {

        var promise = dataService.getProjectActivities(cadastaProject.id);

        promise.then(function (response) {
            $scope.allActivities = response;

            //reformat date created of activity list
            $scope.allActivities.features.forEach(function (activity) {
                activity.properties.time_created = utilityService.formatDate(activity.properties.time_created);
            });

        }, function (err) {
            $scope.allActivities = "Server Error";
        });
    }

    getActivities();

    // update activity type on selection
    $scope.filterActivityType = function (type){
        $scope.ActivityTypeModel = type;
    };

    $scope.activity_types = activityTypes;

    // listen for new parcels to get activity
    $scope.$on('new-parcel', function(e){
        getActivities();
    });

    // listen for updated parcels to get activity
    $scope.$on('update-parcel', function(e){
        getActivities();
    });

    // listen for new parties to get activity
    $scope.$on('new-party', function(e){
        getActivities();
    });

    // listen for updated parties to get activity
    $scope.$on('updated-party', function(e){
        getActivities();
    });


    // listen for new parties to get activity
    $scope.$on('new-relationship', function(e){
        getActivities();
    });

    // listen for new parties to get activity
    $scope.$on('updated-relationship', function(e){
        getActivities();
    });




    }]);

