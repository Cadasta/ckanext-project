var app = angular.module("app");


app.controller("headerCtrl", ['$scope', '$rootScope','$state', '$stateParams','$location', 'dataService','paramService','ckanId','cadastaProject', 'USER_ROLES', 'PROJECT_ADMIN_ROLES', 'userRole',
    function($scope, $rootScope,$state, $stateParams, $location, dataService, paramService, ckanId, cadastaProject, USER_ROLES, PROJECT_ADMIN_ROLES, userRole) {

    $scope.projectTitle = cadastaProject.title;
    $scope.projectId = ckanId;

    // Add user's role to the scope
    $scope.nonPublic = PROJECT_ADMIN_ROLES.indexOf(userRole) > -1 ? true : false;

    $scope.alertValidateData = function(){
            $rootScope.$broadcast('validate-data');
        }

    $scope.alertValidateDatum = function(){
        $rootScope.$broadcast('validate-datum');
    }

}]);