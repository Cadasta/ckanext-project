var app = angular.module("app");


app.controller("headerCtrl", ['$scope', '$rootScope','$state', '$stateParams','$location', 'dataService','paramService','ckanId','cadastaProject', function($scope, $rootScope,$state, $stateParams, $location, dataService, paramService, ckanId, cadastaProject) {

    $scope.projectTitle = cadastaProject.title;
    $scope.projectId = ckanId;

}]);