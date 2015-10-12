var app = angular.module("app");


app.controller("fieldDataCtrl", ['$scope', '$rootScope', '$state', '$stateParams', '$location', 'dataService', 'paramService', 'FileUploader', 'ENV', 'fieldDataService',
    function ($scope, $rootScope, $state, $stateParams, $location, dataService, paramService, FileUploader, ENV, fieldDataService) {

        $scope.response = '';
        $scope.progress = 0;
        $scope.formObj = {};

        // validate xls file
        $scope.uploader = new FileUploader({
            alias: 'xls_file',
            url: ENV.apiCadastaRoot + '/providers/ona/validate'
        });

        $scope.uploader.onProgressItem = function (item, progress) {
            $scope.progress = progress;
        };

        // triggered when FileItem is has completed .upload()
        $scope.uploader.onCompleteItem = function (fileItem, response, status, headers) {
            // record response
            $scope.response = response.status || response.text || '';

            if (response.error){
                $scope.response = response.error;     
            }

            //successful validation response from data-transformer
            if (response.hasOwnProperty("status")
                && response.hasOwnProperty("data")) {

                // save the converted xls form.
                // This gets uploaded to the data-transformer formProcessor
                $scope.formObj = response.data;

                //upload form to ONA
                submitONA(fileItem);
            }

            // handle successful upload response from ONA
            if (response.hasOwnProperty('formid') == true) {
                $scope.response = 'Uploading to Cadasta DB..........';

                // TODO automate this process outside of CKAN
                // TODO API endpoint NEEDs this FormID
                // add form id to obj for Cadasta DB
                $scope.formObj.formid = response.formid;

                //submit form to Cadata DB
                fieldDataService.submitForm($scope.formObj, function(response){
                    $scope.response = response;
                })
            }

        };

        // edit file options to upload file to ONA
        var submitONA = function (fileItem) {

            fileItem.alias = 'xls_file';
            fileItem.url = 'http://54.245.82.92/api/v1/forms';
            fileItem.headers = {
                'Authorization': 'Token 74756f0ab0da149f649e9074c529b633f3daaa02'
            };

            //upload file to ONA, triggering .onCompleteItem upon success
            fileItem.upload();
        }

    }]);
