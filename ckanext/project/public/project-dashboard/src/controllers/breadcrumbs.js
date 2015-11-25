
var app = angular.module("app");


app.controller("breadcrumbsCtrl", ['$scope', '$state', '$stateParams','$location', 'dataService','paramService','ckanId','cadastaProject', 'ENV', function($scope, $state, $stateParams, $location, dataService, paramService,ckanId, cadastaProject, ENV) {

    $scope.tab = '';
    $scope.tab_parcel = '';
    $scope.tab_relationship = '';
    $scope.tab_party = '';
    $scope.ckanId = ckanId;
    $scope.cadastaProject = cadastaProject;
    $scope.ENV = ENV;

    // listen for tab change
    $scope.$on('tab-change',function(evt,data){
         $scope.tab = data.tab;
         // clear tab entity id's
         $scope.clearBreadCrumb();
    });

    // clear inner tab parcel on 'Back to Parcel List click'
    $scope.$on('clear-inner-tabs',function(evt,data){
        $scope.clearBreadCrumb();
    });

    // set breadcrumb id to parcel id
    $scope.$on('parcel-details',function(evt,params){
        if(params){
            $scope.tab_parcel = params.id;
        }
    });

    // set breadcrumb id to party id
    $scope.$on('party-details',function(evt,params){
        if(params){
            $scope.tab_party = params.id;
        }
    });

    // set breadcrumb id to relationship id
    $scope.$on('relationship-details',function(evt,params){
        if(params){
            $scope.tab_relationship = params.id;
        }
    });

    // clear all breadcrumbs
    $scope.clearBreadCrumb = function () {
        $scope.tab_parcel = '';
        $scope.tab_relationship = '';
        $scope.tab_party = '';
    };

    // set tab to Overview on project title breadcrumb selection
    $scope.setOverviewTab = function () {
        $scope.tab = 'Overview';
    }

    $scope.go = function ( path ) {
        $location.path( path );
    };

}]);
