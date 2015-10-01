var OrganizationDashboardApp = angular.module("OrganizationDashboardApp");


OrganizationDashboardApp.controller("orgOverviewCtrl", ['$scope', '$rootScope','$state', '$stateParams','$location','paramService', function($scope, $rootScope,$state, $stateParams, $location, paramService) {


    $scope.organizationName = 'my test organization';
    $scope.organizationProjectsNum = 3;

}]);