
var OrganizationDashboardApp = angular.module("OrganizationDashboardApp");


OrganizationDashboardApp.controller("breadcrumbCtrl", ['$scope', '$state', '$stateParams','$location','paramService', function($scope, $state, $stateParams, $location, paramService) {

    $scope.tab = '';
    $scope.tab_parcel = '';

    // listen for tab change
    $scope.$on('tab-change',function(evt,data){
        $scope.tab = data.tab;
        if(!data.parcel){
            $scope.tab_parcel = '';
        }
    });



}]);