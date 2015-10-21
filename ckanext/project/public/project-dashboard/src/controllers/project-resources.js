var app = angular.module("app");


app.controller("resourceCtrl", ['$scope', '$state', '$stateParams','dataService', 'utilityService','$rootScope', '$mdDialog','FileUploader', 'ENV','ckanId','cadastaProject', function($scope, $state, $stateParams, dataService, utilityService, $rootScope, $mdDialog, FileUploader, ENV, ckanId, cadastaProject){

    if($state.current.name !== "tabs.resources") {
        return;
    }

    $rootScope.$broadcast('tab-change', {tab: 'Resources'}); // notify breadcrumbs of tab on page load

    // update resource type on selection
    $scope.filterResourceType = function (type){
        $scope.ResourceTypeModel = type;
    };

    getResources(true); //  get resources, cache results

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

    $scope.response = '';
    $scope.error = '';
    $scope.progress = 0;

    $scope.showAdvanced = function(ev) {

        $mdDialog.show({
            controller: DialogController,
            templateUrl: '/project-dashboard/src/partials/data_upload.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true
        })
    };

    function getResources (cache){
        var promise = dataService.getProjectResources(cadastaProject.id, cache);

        promise.then(function(response){
            $scope.allResources = response;

            //reformat date created of activity list
            $scope.allResources.features.forEach(function(resource) {
                resource.properties.time_created = utilityService.formatDate(resource.properties.time_created);
            });


        },function(err){
            $scope.overviewData = "Server Error";
        });
    }

    function DialogController($scope, $mdDialog, FileUploader) {

        $scope.uploader = new FileUploader({
            alias: 'filedata',
            ////todo - add in dynamic resource upload, this endpoint needs to be updated
            url: ENV.apiCadastaRoot + '/projects/'+ cadastaProject.id + '/project/' + cadastaProject.id + '/resources'
        });


        $scope.uploader.onProgressItem = function (item, progress) {
            $scope.progress = progress;
        };

        // triggered when FileItem is has completed .upload()
        $scope.uploader.onCompleteItem = function (fileItem, response, status, headers) {
            if (response.message == "Success"){
                $scope.response = 'File Successfully uploaded.';
                $scope.error = ''; // clear error
                $scope.uploader.clearQueue();

                getResources(false); // get resources, do not cache
            }
        };

        $scope.uploader.onAfterAddingFile = function() {
            //remove previous item from queue
            if($scope.uploader.queue.length > 1){
                $scope.uploader.removeFromQueue(0);
            }
        };

        $scope.uploader.onErrorItem = function (item, response, status, headers) {
            if(response.type == "duplicate"){
                $scope.error = 'This resource already exists. Rename resource to complete upload.'
            } else {
                $scope.error = response.error;
            }

            $scope.uploader.clearQueue();
        };

        $scope.hide = function() {
            $mdDialog.hide();
        };
        $scope.cancel = function() {
            $mdDialog.cancel();
        };
        $scope.answer = function(answer) {
            $mdDialog.hide(answer);
        };
    }

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






