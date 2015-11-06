
var app = angular.module("app");


app.controller("breadcrumbsCtrl", ['$scope', '$state', '$stateParams','$location', 'dataService','paramService','ckanId','cadastaProject', 'ENV', function($scope, $state, $stateParams, $location, dataService, paramService,ckanId, cadastaProject, ENV) {

    $scope.tab = '';
    $scope.tab_parcel = '';
    $scope.tab_relationship = '';
    $scope.ckanId = ckanId;
    $scope.cadastaProject = cadastaProject;
    $scope.ENV = ENV;

    // listen for tab change
    $scope.$on('tab-change',function(evt,data){
        $scope.tab = data.tab;
        if(!data.parcel){
            $scope.tab_parcel = '';
        }
        if(!data.relationship){
            $scope.tab_relationship = '';
        }
    });

    // clear inner tab parcel on 'Back to Parcel List click'
    $scope.$on('clear-inner-tabs',function(evt,data){
        $scope.tab_parcel = '';
    });

    $scope.$on('parcel-details',function(evt,params){
        if(params){
            $scope.tab_parcel = params.id;
        }
    });


    // clear inner tab parcel on 'Back to Parcel List click'
    $scope.$on('clear-inner-relationship-tab',function(evt,data){
        $scope.tab_relationship = '';
    });

    $scope.$on('relationship-details',function(evt,params){
        if(params){
            $scope.tab_relationship = params.id;
        }
    });

    $scope.go = function ( path ) {
        $location.path( path );
    };

}]);
