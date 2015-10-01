var app = angular.module("app");


app.controller("fieldDataCtrl", ['$scope', '$rootScope', '$state', '$stateParams', '$location', 'dataService', 'paramService', 'FileUploader','ENV',
    function ($scope, $rootScope, $state, $stateParams, $location, dataService, paramService, FileUploader,ENV) {

        $scope.response = '';

        $scope.uploader = new FileUploader({
            onBeforeUpload: function () {
                console.log('Before Upload');
            },
            alias: 'xls_file',
            url: 'http://54.245.82.92/api/v1/forms',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Token 74756f0ab0da149f649e9074c529b633f3daaa02'

            }
        });

        $scope.uploader.onProgressItem = function (item, progress) {
            console.log(progress);
        }

        $scope.uploader.onSuccessItem = function (response, status, headers) {
            console.log(response);
        }

        $scope.uploader.onCompleteItem = function (fileItem, response, status, headers) {
            //console.info('onCompleteItem', fileItem, response, status, headers);
            $scope.response = response;
        };

    }]);