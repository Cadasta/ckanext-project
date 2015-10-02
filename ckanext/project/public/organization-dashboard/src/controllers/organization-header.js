var OrganizationDashboardApp = angular.module("OrganizationDashboardApp");


OrganizationDashboardApp.controller("orgHeaderCtrl", ['$scope', '$rootScope','$state', '$stateParams','$location','paramService', function($scope, $rootScope,$state, $stateParams, $location, paramService) {

    $scope.orgTitle = 'Habitat for Humanity';

}]);