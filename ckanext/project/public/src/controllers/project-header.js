var app = angular.module("app");


app.controller("headerCtrl", ['$scope', '$rootScope','$state', '$stateParams','$location', 'dataService','paramService', function($scope, $rootScope,$state, $stateParams, $location, dataService, paramService) {

    $scope.projectTitle = 'example project title';

}]);