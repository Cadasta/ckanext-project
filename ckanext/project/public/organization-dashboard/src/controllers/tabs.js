
var OrganizationDashboardApp = angular.module("OrganizationDashboardApp");


OrganizationDashboardApp.controller("orgTabsCtrl", ['$scope', '$rootScope','$state', '$stateParams','$location','paramService', function($scope, $rootScope,$state, $stateParams, $location, paramService) {


    $scope.setTab = function(tab){
        var isParcel = (tab == 'Parcel');

        $rootScope.$broadcast('tab-change', {tab: tab, parcel:isParcel});

    }

}]);