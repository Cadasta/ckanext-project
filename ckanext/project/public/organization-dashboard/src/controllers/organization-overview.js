var OrganizationDashboardApp = angular.module("OrganizationDashboardApp");


OrganizationDashboardApp.controller("orgOverviewCtrl", ['$scope', '$rootScope', '$state', '$stateParams', '$location', 'paramService', 'dataService', function ($scope, $rootScope, $state, $stateParams, $location, paramService, dataService) {


    $scope.organizationProjectsNum = 3;
    $scope.organizationDescription = "Intelligentsia squid occupy, food truck Blue Bottle sartorial narwhal cardigan shabby chic you probably haven't heard of them post-ironic readymade Williamsburg. " +
        "Wayfarers synth YOLO scenester distillery, Vice roof party XOXO shabby chic. Four loko lumbersexual Carles meditation. Church-key 8-bit typewriter flannel Bushwick disrupt mumblecore plaid. " +
        "Gastropub lo-fi migas actually. Wolf PBR&B master cleanse vinyl, hoodie vegan aesthetic Austin flexitarian retro Echo Park Shoreditch meditation Bushwick. XOXO +1 try-hard readymade Pitchfork."

    $scope.projects = [1,2,3];

    $scope.users = ['person1', 'person2', 'person3'];



    // Get overview data
    var promise = dataService.getAllActivities();

    promise.then(function(response){

        $scope.orgOverviewData = response;
        //$scope.activityList = response.features[0].properties.project_activity;
        //
        ////todo upate with data from ckan
        //$scope.overviewData.description = "This project is working with locals in Bolivia.  The community includes 10,000 people of which 149 have official land ownership documents."
        //
        //
        ////reformat date created of resources
        //$scope.overviewData.features[0].properties.project_resources.forEach(function(resource) {
        //    resource.properties.time_created = utilityService.formatDate(resource.properties.time_created);
        //});
        //
        ////reformat date created of activity list
        //$scope.overviewData.features[0].properties.project_activity.forEach(function(activity) {
        //    activity.properties.time_created = utilityService.formatDate(activity.properties.time_created);
        //});


    },function(err){
        $scope.overviewData = "Server Error";
    });

}]);