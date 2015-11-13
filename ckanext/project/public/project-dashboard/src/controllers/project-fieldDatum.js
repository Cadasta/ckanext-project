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
            columnDefs: [
                {
                    cellRenderer: {
                        checkbox: true
                    }
                }
            ],
            rowData: [],
            enableSorting: true,
            enableColResize: true,
            rowSelection: 'multiple',
            //onRowSelected: rowSelectedFunc,
            checkboxSelection: true,
            suppressRowClickSelection: true,
            onCellClicked: cellClickedFunction
        };

        //function rowSelectedFunc(event) {
        //    console.log(event.node.data);
        //}

        $scope.selectedCellText = '';

        function cellClickedFunction(event) {
            $rootScope.$apply(function () {
                console.log(event.value);
                $scope.selectedCellText = event.value;
            })
        }

        getFieldDataResponses();

        function getFieldDataResponses() {
            var promise = fieldDataService.getResponses(cadastaProject.id, $stateParams.id);


            promise.then(function (response) {
                var columnDefs = [];
                var rowData = [];

                columnDefs.push({headerName: 'Respondent ID', field: 'respondent_id', checkboxSelection: true});

                // put colums definitions together
                response.features[0].properties.questions.forEach(function (v) {
                    columnDefs.push({headerName: v.properties.label, field: v.properties.question_id})
                });

                //// sort by label
                //columnDefs.sort(function(a,b){
                //    return a.headerName.toLowerCase() > b.headerName.toLowerCase();
                //})

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
