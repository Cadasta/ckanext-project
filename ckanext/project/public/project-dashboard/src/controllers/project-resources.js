var app = angular.module("app");


app.controller("resourceCtrl", ['$scope', '$state', '$stateParams','dataService', 'utilityService','$rootScope', '$mdDialog','FileUploader', 'ENV','ckanId','cadastaProject', function($scope, $state, $stateParams, dataService, utilityService, $rootScope, $mdDialog, FileUploader, ENV, ckanId, cadastaProject){

    if($state.current.name !== "tabs.resources") {
        return;
    }

    $rootScope.$broadcast('tab-change', {tab: 'Resources'}); // notify breadcrumbs of tab on page load

    var promise = dataService.getProjectResources(cadastaProject.id);

    promise.then(function(response){
        $scope.allResources = response;

        //reformat date created of activity list
        $scope.allResources.features.forEach(function(resource) {
            resource.properties.time_created = utilityService.formatDate(resource.properties.time_created);
        });


    },function(err){
        $scope.overviewData = "Server Error";
    });


    // update resource type on selection
    $scope.filterResourceType = function (type){
        $scope.ResourceTypeModel = type;
    };

    $scope.resource_types = [
        {
            type: 'all',
            label: 'All Resources'
        },
        {
            type: 'project',
            label: 'Project Resources'
        },
        {
            type: 'parcel',
            label: 'Parcel Resources'
        },
        {
            type: 'party',
            label: 'Party Resources'
        },
        {
            type: 'relationship',
            label: 'Relationship Resources'
        }
    ];

    $scope.sort_by = [
        {
            type: 'name',
            label: 'Name'
        },
        {
            type: 'time_created',
            label: 'Date'
        }
    ];


    $scope.status = '  ';

    $scope.uploader = new FileUploader({
        //alias: 'filedata',
        ////todo - add in dynamic resource upload, this endpoint needs to be updated
        //url: ENV.apiCadastaRoot + '/resources/'+ cadastaProject.id
    });


    $scope.showAdvanced = function(ev) {

        $mdDialog.show({
            //controller: "resourceCtrl",
            scope: $scope,
            templateUrl: '/project-dashboard/src/partials/data_upload.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true
        })
    };

    $scope.cancel = function() {
        $mdDialog.cancel();
    };

}]);



// custom tenure type filter
app.filter('resourceType', function () {
    return function(inputs,filter_type) {
        var output = [];
        switch(filter_type){
            case 'project':
            case 'parcel':
            case 'party':
            case 'relationship':
                //check if array contains filter selection
                inputs.forEach(function (input) {
                    if (filter_type.indexOf(input.properties.type) !== -1)
                        output.push(input);
                });
                return output;
                break;
            case 'time_created':
                // create unique copy of array
                var arr = inputs.slice();
                // sort by date DESC
                arr.sort(function(a,b){
                    var a_date = new Date(a.properties.time_created);
                    var b_date = new Date(b.properties.time_created);
                    return   b_date - a_date;
                });
                return arr;
                break;
            case 'id':
                // sort by ASC
                var arr = inputs.slice();
                arr.sort(function(a,b){
                    return a.properties.description - b.properties.description;
                });
                return arr;
                break;
            default:
                return inputs;
        }
    };
});






