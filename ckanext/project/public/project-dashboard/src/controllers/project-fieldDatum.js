var app = angular.module("app");


app.controller("fieldDatumCtrl", ['$scope', '$rootScope', '$state', '$stateParams', '$location', 'dataService', 'paramService', 'FileUploader', 'ENV', 'onaService', 'cadastaProject', 'fieldDataService',
    function ($scope, $rootScope, $state, $stateParams, $location, dataService, paramService, FileUploader, ENV, onaService, cadastaProject, fieldDataService) {

        $scope.response = '';
        $scope.progress = 0;
        $scope.formObj = {};


        /**
         * Initialize ag-grid table
         */
        $scope.gridOptions = {
            columnDefs: [],
            rowData: [],
            enableSorting: true,
            enableColResize: true,
            rowSelection: 'multiple',
            onRowSelected: rowSelectedFunc,
            checkboxSelection: true,
            suppressRowClickSelection: true,
            onCellClicked: cellClickedFunction
        };

        function rowSelectedFunc(event) {
            console.log($scope.gridOptions.api.getSelectedNodes());
        }



        $scope.selectedCellText = '';


        function cellClickedFunction(event) {
            $rootScope.$apply(function () {
                console.log(event.value);
                $scope.selectedCellText = event.value;
            })
        }


        $scope.updateStatusRows = function(status) {

            var selectedRespondentIds = [];

            $scope.gridOptions.api.getSelectedNodes().forEach(function(row) {
                selectedRespondentIds.push(row.data.respondent_id);
            });

            var validate_promise = fieldDataService.updateStatusOfRespondents(cadastaProject.id, $stateParams.id, selectedRespondentIds, status);

            validate_promise.then(function(response) {
                getFieldDataResponses();

                console.log(response);

                $scope.successMessage = 'Respondent(s) ' + response.cadasta_validate_respondent + ' have been updated.';


            }, function (err) {
                $scope.parties = "Server Error";
                $scope.errorMessage = 'There was an error updating respondents.';
            });
        }


        getFieldDataResponses();

        function getFieldDataResponses(updatedRows) {
            var promise = fieldDataService.getResponses(cadastaProject.id, $stateParams.id);


            promise.then(function (response) {
                var columnDefs = [];
                var rowData = [];

                columnDefs.push({headerName: 'Respondent ID', field: 'respondent_id', checkboxSelection: true, minWidth:110 });
                columnDefs.push({headerName: 'Validated', field: 'validated', minWidth:90});


                // put colums definitions together
                response.features[0].properties.questions.forEach(function (v) {
                    columnDefs.push({headerName: v.properties.label, field: v.properties.question_id, minWidth:90})
                });


                // set table columns
                $scope.gridOptions.api.setColumnDefs(columnDefs);

                var dict = {};

                response.features[0].properties.responses.forEach(function (res) {
                        dict[res.properties.respondent_id] = {}

                    }
                );

                Object.keys(dict).forEach(function (k) {
                    var qad = {};
                    response.features[0].properties.responses.forEach(function (res) {
                        if (res.properties.respondent_id == k) {
                            qad[res.properties.question_id] = res.properties.text;
                            qad['validated'] = res.properties.validated;
                            qad['respondent_id'] = res.properties.respondent_id;
                            dict[k] = qad;
                        }
                    })
                    rowData.push(qad);
                });

                // add data to column rows
                $scope.gridOptions.api.setRowData(rowData);
                $scope.gridOptions.api.sizeColumnsToFit();

            })
        }

        // validate xls file
        $scope.uploader = new FileUploader({
            alias: 'xls_file',
            url: ENV.apiCadastaRoot + '/providers/ona/load-form/' + cadastaProject.id
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

    }
]);
