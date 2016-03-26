var app = angular.module("app");


app.controller("activityCtrl", ['activityTypes','$scope', '$state', '$stateParams','dataService', 'utilityService', '$rootScope', 'ckanId', 'cadastaProject',
    function(activityTypes,$scope, $state, $stateParams, dataService, utilityService,$rootScope,ckanId, cadastaProject){
    if($state.current.name !== "tabs.activity") {
        return;
    }

    $rootScope.$broadcast('tab-change', {tab: 'Activity'}); // notify breadcrumbs of tab on page load

    $scope.pageSize = 20;

    function getActivities(limit, offset) {

        var promise = dataService.getProjectActivities(cadastaProject.id, limit, offset);

        promise.then(function (response) {
            var contentRange = response.headers('Content-Range');
            $scope.totalItems = parseInt(contentRange.split('/')[1]);
            $scope.allActivities = response.data.result;
            var features = response.data.result.features

            //reformat date created of activity list
            features.forEach(function (activity) {
                activity.properties.time_created = utilityService.formatDate(activity.properties.time_created);
            });

        }, function (err) {
            $scope.allActivities = "Server Error";
        });
    }

    getActivities($scope.pageSize, 0);

    $scope.pageChanged = function() {
        var offset = $scope.pageSize * ($scope.currentPage -1);
        getActivities($scope.pageSize, offset);
    };


    // update activity type on selection
    $scope.filterActivityType = function (type){
        $scope.ActivityTypeModel = type;
    };

    $scope.activity_types = activityTypes;

    // listen for new parcels to get activity
    $scope.$on('new-parcel', function(e){
        getActivities($scope.pageSize, 0);
    });

    // listen for updated parcels to get activity
    $scope.$on('update-parcel', function(e){
        getActivities($scope.pageSize, 0);
    });

    // listen for new parties to get activity
    $scope.$on('new-party', function(e){
        getActivities($scope.pageSize, 0);
    });

    // listen for updated parties to get activity
    $scope.$on('updated-party', function(e){
        getActivities($scope.pageSize, 0);
    });


    // listen for new parties to get activity
    $scope.$on('new-relationship', function(e){
        getActivities($scope.pageSize, 0);
    });

    // listen for new parties to get activity
    $scope.$on('updated-relationship', function(e){
        getActivities($scope.pageSize, 0);
    });




    }]);

