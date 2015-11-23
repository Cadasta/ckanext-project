var app = angular.module("app");


app.controller("fieldDataCtrl", ['$scope', '$rootScope', '$state', '$stateParams', '$location', 'dataService', 'paramService', 'FileUploader', 'ENV', 'cadastaProject', 'fieldDataService', 'utilityService', '$mdDialog',
    function ($scope, $rootScope, $state, $stateParams, $location, dataService, paramService, FileUploader, ENV, cadastaProject, fieldDataService, utilityService, $mdDialog) {



        //modal for adding a parcel
        var fieldDataModal = function () {
            $mdDialog.show({
                templateUrl: '/project-dashboard/src/partials/fieldDataList.html',
                controller: fieldDataModalCtrl,
                parent: angular.element(document.body),
                clickOutsideToClose: false,
                escapeToClose: false
                //locals: {cadastaProject: cadastaProject}
            })
        };

        fieldDataModal();

        $scope.$on('validate-data', function(e){
            fieldDataModal();
        });


        function fieldDataModalCtrl($scope, $mdDialog, $stateParams, utilityService) {
            $scope.hide = function () {
                $mdDialog.hide();
                $state.go("tabs.overview.project-overview");
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
                $state.go("tabs.overview.project-overview");
            };

            $scope.alertValidateDatum = function () {
                $rootScope.$broadcast('validate-datum');
            }


            $scope.response = '';
            $scope.error = '';
            $scope.progress = '';

            $scope.formObj = {};

            function resetProgress() {
                $scope.progress = 0;
            }

            getFieldData();

            function getFieldData() {
                var promise = fieldDataService.getFieldData(cadastaProject.id);

                promise.then(function (response) {

                    response.features.forEach(function (fieldDatum) {
                        fieldDatum.properties.time_created = utilityService.formatDate(fieldDatum.properties.time_created);
                    });

                    $scope.fieldDataList = response.features;

                })
            }

            // validate xls file
            $scope.uploader = new FileUploader({
                alias: 'xls_file',
                url: ENV.apiCKANRoot + '/cadasta_upload_ona_form',
                removeAfterUpload: true
            });

            $scope.uploader.onBeforeUploadItem = function (item) {
                // upload required path params for CKAN to proxy
                item.formData.push({
                    project_id: cadastaProject.id
                });
            };

            $scope.uploader.onAfterAddingFile = function (item) {

                if (item.file.name.indexOf('xls') == -1) {
                    item.remove();
                    utilityService.showToast('Invalid file type');
                } else {

                    // only allow one file item in the queue
                    if ($scope.uploader.queue.length > 1) {
                        $scope.uploader.removeFromQueue(0);
                    }

                    //clear progress and error messages
                    $scope.progress = '';
                    $scope.error = '';
                }
            }

            $scope.uploader.onProgressItem = function (item, progress) {
                $scope.progress = progress;
            };

            // triggered when FileItem is has completed .upload()
            $scope.uploader.onCompleteItem = function (fileItem, response, status, headers) {

                if (response.result.status == "OK") {
                    resetProgress();
                    getFieldData(); // get new field data
                    $scope.response = 'Successfully Uploaded Field Data Form'

                }
                else if (response.result.status === "ERROR" || response.result.status == "NO_ONA_API_KEY"){
                    utilityService.showToast( (response.result.message || response.result.msg));
                    resetProgress();
                    $scope.response = '';

                }
            }

            $scope.uploader.onErrorItem = function (item, response, status, headers) {
                $scope.uploader.clearQueue();
                resetProgress();
                $scope.response = '';

                utilityService.showToast('Error uploading survey format. Error: ' + response);
            }
        }
    }]);
