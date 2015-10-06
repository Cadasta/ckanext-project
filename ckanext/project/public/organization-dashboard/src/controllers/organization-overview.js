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
        $scope.orgOverviewData.activityList = response.features;


        //reformat date created of resources
        $scope.orgOverviewData.features.forEach(function(activity) {
            activity.properties.time_created = dataService.formatDate(activity.properties.time_created);
        });


    },function(err){
        $scope.overviewData = "Server Error";
    });


    //Get CKAN data
    var CKAN_promise = dataService.getCKANOrgDetails();

    CKAN_promise.then(function(response) {
        $scope.orgDescription = response.result.description;
    })


    //Get CKAN activity data
    var CKAN_activity_promise = dataService.getCKANOrgActivities();

    CKAN_activity_promise.then(function(response) {
        $scope.CKANorgActivities = response.result;

    //reformat date created of activities
        $scope.CKANorgActivities.forEach(function(activity) {
        activity.timestamp = dataService.formatDate(activity.timestamp);
    });

    })





}]);