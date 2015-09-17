
var app = angular.module("app");


app.controller("breadcrumbsCtrl", ['$scope', '$state', '$stateParams','$location', 'dataService','paramService', function($scope, $state, $stateParams, $location, dataService, paramService) {

    $scope.tab = 'Overview';

    // listen for tab change
    $scope.$on('tab-change',function(evt,data){
        $scope.tab = data.tab;
    })

}]);