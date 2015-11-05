var app = angular.module("app");


app.controller("fieldDataCtrl", ['$scope', '$rootScope', '$state', '$stateParams', '$location', 'dataService', 'paramService', 'FileUploader', 'ENV', 'fieldDataService', 'cadastaProject',
    function ($scope, $rootScope, $state, $stateParams, $location, dataService, paramService, FileUploader, ENV, fieldDataService, cadastaProject) {

        $scope.response = '';
        $scope.progress = 0;
        $scope.formObj = {};



        var columnDefs = [
            {headerName: "Make", field: "make"},
            {headerName: "Model", field: "model"},
            {headerName: "Price", field: "price"}
        ];

        var rowData = [
            {make: "Toyota", model: "Celica", price: 35000},
            {make: "Ford", model: "Mondeo", price: 32000},
            {make: "Porsche", model: "Boxter", price: 72000}
        ];

        $scope.gridOptions = {
            columnDefs: columnDefs,
            rowData: rowData
        };



        // validate xls file
        $scope.uploader = new FileUploader({
            alias: 'xls_file',
            url: 'http://54.69.121.180:3456/providers/ona/load-form/' + cadastaProject.id
        });

        $scope.uploader.onProgressItem = function (item, progress) {
            $scope.progress = progress;
        };

        // triggered when FileItem is has completed .upload()
        $scope.uploader.onCompleteItem = function (fileItem, response, status, headers) {

            $scope.response = response;

        };

        $scope.uploader.onErrorItem = function (item, response, status, headers) {

            $scope.response = response;

        }

    }]);