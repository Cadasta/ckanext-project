
var app = angular.module("app");


app.controller("tabsCtrl", ['$scope', '$rootScope','$state', '$stateParams','$location', 'dataService','paramService','userRole','TABS_USER_ROLES',
    function($scope, $rootScope,$state, $stateParams, $location, dataService, paramService, userRole, TABS_USER_ROLES) {

    // Add user's role to the scope
    $scope.showTabs = TABS_USER_ROLES.indexOf(userRole) > -1 ? true : false;



        $scope.setTab = function(tab){
        var isParcel = (tab == 'Parcel');

        $rootScope.$broadcast('tab-change', {tab: tab, parcel:isParcel});

    }

}]);