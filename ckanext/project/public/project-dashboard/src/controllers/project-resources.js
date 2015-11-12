var app = angular.module("app");


app.controller("resourceCtrl", ['$scope', '$state', '$stateParams','dataService', 'utilityService','$rootScope', '$mdDialog','FileUploader', 'ENV','ckanId','cadastaProject', 'USER_ROLES', 'PROJECT_CRUD_ROLES', 'userRole',
    function($scope, $state, $stateParams, dataService, utilityService, $rootScope, $mdDialog, FileUploader, ENV, ckanId, cadastaProject, USER_ROLES, PROJECT_CRUD_ROLES, userRole){


    if($state.current.name !== "tabs.resources") {
        return;
    }


    // Add user's role to the scope
    $scope.showCRUDLink = PROJECT_CRUD_ROLES.indexOf(userRole) > -1;


        $rootScope.$broadcast('tab-change', {tab: 'Resources'}); // notify breadcrumbs of tab on page load

    // update resource type on selection
    $scope.filterResourceType = function (type){
        $scope.ResourceTypeModel = type;
    };

    getResources(false); //  get resources, cache results

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

    // listen for new resources
    $scope.$on('new-resource', function(e){
        getResources(false);
    });

    function DialogController($scope, $mdDialog, FileUploader) {

        $scope.uploader = new FileUploader({
            alias: 'filedata',
            url: ENV.apiCKANRoot + '/cadasta_upload_project_resources'
        });

        $scope.uploader.onBeforeUploadItem = function (item) {
            // upload required path params
            item.formData.push({
                project_id: cadastaProject.id,
                resource_type: "project",
                resource_type_id: cadastaProject.id
            });
        };


        $scope.uploader.onProgressItem = function (item, progress) {
            $scope.progress = progress;
        };

        // triggered when FileItem is has completed .upload()
        $scope.uploader.onCompleteItem = function (fileItem, response, status, headers) {
            //
            // ckan api wrappers return a 'result' key for successful calls
            // and an 'error' key for unsuccessful calls
            //
            if (response.result && response.result.message == "Success"){
                $scope.response = 'File Successfully uploaded.';
                $scope.error = ''; // clear error
                $scope.uploader.clearQueue();

                getResources(false); // get resources, do not cache
                $rootScope.$broadcast('new-resource'); // broadcast new resources to the app
            }
            else if(response.error){

                if (response.error.type && response.error.type.pop && response.error.type.pop() === "duplicate") {
                    $scope.error = 'This resource already exists. Rename resource to complete upload.';
                }
                else if(response.error.message) {
                    $scope.error = response.error.message;
                }
                else {
                    $scope.error = response.error;
                }
            }
        };

        $scope.uploader.onAfterAddingFile = function() {
            //remove previous item from queue
            if($scope.uploader.queue.length > 1){
                $scope.uploader.removeFromQueue(0);
            }
        };

        $scope.uploader.onErrorItem = function (item, response, status, headers) {
            if(response.error.type == "duplicate"){
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







