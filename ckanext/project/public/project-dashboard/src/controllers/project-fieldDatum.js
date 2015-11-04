var app = angular.module("app");


app.controller("fieldDatumCtrl", ['$scope', '$rootScope', '$state', '$stateParams', '$location', 'dataService', 'paramService', 'FileUploader', 'ENV', 'fieldDataService', 'cadastaProject',
    function ($scope, $rootScope, $state, $stateParams, $location, dataService, paramService, FileUploader, ENV, fieldDataService, cadastaProject) {

        var columnDefs = [
            {headerName: "Make", field: "make"},
            {headerName: "Model", field: "model"},
            {headerName: "Makers", field: "markers"}
        ];

        var rowData = [
            //{make: "Toyota", model: "Celica", price: 35000},
            //{make: "Ford", model: "Mondeo", price: 32000},
            {make: "Porsche", model: "Boxter", price: 72000}
        ];

        $scope.gridOptions = {
            columnDefs: columnDefs,
            rowData: rowData
        };


    }]);