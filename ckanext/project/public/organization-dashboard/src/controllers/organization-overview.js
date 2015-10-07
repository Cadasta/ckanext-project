var OrganizationDashboardApp = angular.module("OrganizationDashboardApp");


OrganizationDashboardApp.controller("orgOverviewCtrl", ['$scope', '$rootScope', '$state', '$stateParams', '$location', 'paramService', 'dataService', 'ckanOrgId', function ($scope, $rootScope, $state, $stateParams, $location, paramService, dataService, ckanOrgId) {


    //button routing todo - couldn't get this to work at the moment
    $scope.route_add_project = function(){
        $location.path('project/new');
    };

    $scope.orgName = ckanOrgId;



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