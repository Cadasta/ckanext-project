var OrganizationDashboardApp = angular.module("OrganizationDashboardApp");


OrganizationDashboardApp.controller("orgOverviewCtrl", ['$scope', '$rootScope', '$state', '$stateParams', '$location', 'paramService', 'dataService', 'ckanOrgId', function ($scope, $rootScope, $state, $stateParams, $location, paramService, dataService, ckanOrgId) {


    $scope.organizationProjectsNum = 3;
    $scope.organizationDescription = "Intelligentsia squid occupy, food truck Blue Bottle sartorial narwhal cardigan shabby chic you probably haven't heard of them post-ironic readymade Williamsburg. " +
        "Wayfarers synth YOLO scenester distillery, Vice roof party XOXO shabby chic. Four loko lumbersexual Carles meditation. Church-key 8-bit typewriter flannel Bushwick disrupt mumblecore plaid. " +
        "Gastropub lo-fi migas actually. Wolf PBR&B master cleanse vinyl, hoodie vegan aesthetic Austin flexitarian retro Echo Park Shoreditch meditation Bushwick. XOXO +1 try-hard readymade Pitchfork."



    $scope.users = ['person1', 'person2', 'person3'];



    //Get CKAN data
    var CKAN_promise = dataService.getCKANOrgDetails(ckanOrgId);

    CKAN_promise.then(function(response) {
        $scope.orgDescription = response.result.description;

        $scope.orgProjects = response.result.packages;

    //    reformat date for date modified
        $scope.orgProjects.forEach(function(project) {
            project.metadata_modified = dataService.formatDate(project.metadata_modified);
        });

        $scope.orgUsers = response.result.users;


    })


    //Get CKAN activity data
    var CKAN_activity_promise = dataService.getCKANOrgActivities(ckanOrgId);

    CKAN_activity_promise.then(function(response) {
        $scope.CKANorgActivities = response.result;

    //reformat date created of activities
        $scope.CKANorgActivities.forEach(function(activity) {
        activity.timestamp = dataService.formatDate(activity.timestamp);
        });

    })





}]);