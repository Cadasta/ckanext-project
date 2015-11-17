var app = angular.module("app");


app.controller("fieldDataCtrl", ['$scope', '$rootScope', '$state', '$stateParams', '$location', 'dataService', 'paramService', 'FileUploader', 'ENV', 'onaService', 'cadastaProject', 'fieldDataService', 'utilityService', '$mdDialog',
    function ($scope, $rootScope, $state, $stateParams, $location, dataService, paramService, FileUploader, ENV, onaService, cadastaProject, fieldDataService, utilityService, $mdDialog) {



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


        function fieldDataModalCtrl($scope, $mdDialog, $stateParams) {
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
                url: ENV.apiCadastaRoot + '/providers/ona/load-form/' + cadastaProject.id,
                removeAfterUpload: true
            });

            $scope.uploader.onAfterAddingFile = function (item) {

                if (item.file.name.indexOf('xls') == -1) {
                    item.remove();
                    $scope.error = 'Invalid file type';
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
                $scope.progress = 'Uploading......';
            };

            // triggered when FileItem is has completed .upload()
            $scope.uploader.onCompleteItem = function (fileItem, response, status, headers) {

                if (response.status == "OK") {
                    $scope.progress = response.msg;

                    getFieldData(); // get new field data

                }
                ;
            }

            $scope.uploader.onErrorItem = function (item, response, status, headers) {

                $scope.progress = '';
                $scope.error = response.msg;
            }
        }
    }]);
