var app = angular.module("app");


app.controller("fieldDataCtrl", ['$scope', '$rootScope', '$state', '$stateParams', '$location', 'dataService', 'paramService', 'FileUploader', 'ENV', 'onaService', 'cadastaProject', 'fieldDataService', 'utilityService',
    function ($scope, $rootScope, $state, $stateParams, $location, dataService, paramService, FileUploader, ENV, onaService, cadastaProject, fieldDataService, utilityService) {

        $scope.response = '';
        $scope.progress = 0;
        $scope.formObj = {};

        getFieldData();

        function getFieldData(){
            var promise = fieldDataService.getFieldData(cadastaProject.id);

            promise.then(function(response){

                response.features.forEach(function (fieldDatum) {
                    fieldDatum.properties.time_created = utilityService.formatDate(fieldDatum.properties.time_created);
                });

                $scope.fieldDataList = response.features;

            })
        }

        // validate xls file
        $scope.uploader = new FileUploader({
            alias: 'xls_file',
            url: ENV.apiCadastaRoot +'/providers/ona/load-form/' + cadastaProject.id
        });

        $scope.uploader.onProgressItem = function (item, progress) {
            $scope.progress = progress;
        };

        // triggered when FileItem is has completed .upload()
        $scope.uploader.onCompleteItem = function (fileItem, response, status, headers) {

            $scope.response = response;
            getFieldData(); // get new field data

        };

        $scope.uploader.onErrorItem = function (item, response, status, headers) {

            $scope.response = response;

        }

    }]);
