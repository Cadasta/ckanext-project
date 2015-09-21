
var app = angular.module("app");


app.controller("breadcrumbsCtrl", ['$scope', '$state', '$stateParams','$location', 'dataService','paramService', function($scope, $state, $stateParams, $location, dataService, paramService) {

    $scope.tab = '';
    $scope.tab_parcel = '';

    // listen for tab change
    $scope.$on('tab-change',function(evt,data){
        $scope.tab = data.tab;
    });

    $scope.$on('parcel-details',function(evt,params){
        if(params){
            $scope.tab_parcel = params.id;
            console.log('breadcrumbs update');
        }
    });

}]);