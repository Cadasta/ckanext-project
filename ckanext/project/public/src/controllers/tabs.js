
var app = angular.module("app");


app.controller("tabsCtrl", ['$scope', '$rootScope','$state', '$stateParams','$location', 'dataService','paramService', function($scope, $rootScope,$state, $stateParams, $location, dataService, paramService) {


    $scope.setTab = function(tab){
        var isParcel = (tab == 'Parcel');

        $rootScope.$broadcast('tab-change', {tab: tab, parcel:isParcel});

    }

}]);