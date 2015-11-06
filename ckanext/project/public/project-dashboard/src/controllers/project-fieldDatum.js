var app = angular.module("app");


app.controller("fieldDatumCtrl", ['$scope', '$rootScope', '$state', '$stateParams', '$location', 'dataService', 'paramService', 'FileUploader', 'ENV', 'onaService', 'cadastaProject', 'fieldDataService',
    function ($scope, $rootScope, $state, $stateParams, $location, dataService, paramService, FileUploader, ENV, onaService, cadastaProject, fieldDataService) {

        $scope.response = '';
        $scope.progress = 0;
        $scope.formObj = {};

        getFieldDataResponses();

        function getFieldDataResponses() {
            var promise = fieldDataService.getResponses(cadastaProject.id, $stateParams.id);

            /**
             * Initialize ag-grid table
             */
            $scope.gridOptions = {
                columnDefs: [],
                rowData: [],
                enableSorting: true
            };

            promise.then(function (response) {
                var columnDefs = [];
                var rowData = [];

                // put colums definitions together
                response.features[0].properties.questions.forEach(function (v) {
                    columnDefs.push({headerName: v.properties.label, field: v.properties.question_id})
                });

                // sort by label
                columnDefs.sort(function(a,b){
                    return a.headerName.toLowerCase() > b.headerName.toLowerCase();
                })

                // set table columns
                $scope.gridOptions.api.setColumnDefs(columnDefs);

                response.features[0].properties.responses.forEach(function (v) {
                    var obj = {};
                    // put row data together
                    Object.keys(v.properties.response).forEach(function (r, i) {
                        obj[r] = v.properties.response[r];
                    });
                    rowData.push(obj);
                });

                // add data to column rows
                $scope.gridOptions.api.setRowData(rowData);

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
        };

        $scope.uploader.onErrorItem = function (item, response, status, headers) {
            $scope.response = response;
        }

    }]);
