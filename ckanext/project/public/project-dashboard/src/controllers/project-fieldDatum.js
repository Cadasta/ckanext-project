var app = angular.module("app");


app.controller("fieldDatumCtrl", ['$scope', '$rootScope', '$state', '$stateParams', '$location', 'dataService', 'paramService', 'FileUploader', 'ENV', 'onaService', 'cadastaProject', 'fieldDataService', '$mdDialog',
    function ($scope, $rootScope, $state, $stateParams, $location, dataService, paramService, FileUploader, ENV, onaService, cadastaProject, fieldDataService, $mdDialog) {



        //modal for adding a parcel
        var fieldDatumModal = function () {
            $mdDialog.show({
                templateUrl: '/project-dashboard/src/partials/fieldDatum.html',
                controller: fieldDatumModalCtrl,
                parent: angular.element(document.body),
                clickOutsideToClose: false,
                locals: {cadastaProject: cadastaProject}
            })
        };


        fieldDatumModal();

        function fieldDatumModalCtrl($scope, $mdDialog, $stateParams) {
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };


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
                //onRowSelected: rowSelectedFunc,
                checkboxSelection: true,
                suppressRowClickSelection: true,
                onCellClicked: cellClickedFunction
            };

            //function rowSelectedFunc(event) {
            //}

            $scope.selectedCellText = '';


            function cellClickedFunction(event) {
                $rootScope.$apply(function () {
                    $scope.selectedCellText = event.value;
                });

                if (event.colDef.field === 'parcel_id') {
                    $state.go("tabs.parcels.parcel", {id: event.node.data.parcel_id})
                }
                else if (event.colDef.field === 'party_id') {
                    $state.go("tabs.parties.party", {id: event.node.data.party_id})
                }
                else if (event.colDef.field === 'relationship_id') {
                    $state.go("tabs.relationships.relationship", {id: event.node.data.relationship_id})
                }

            }

            $scope.selectAll = function () {
                $scope.gridOptions.api.forEachNode(function (node) {
                    $scope.gridOptions.api.selectNode(node, true);
                });
            };

            var unselectAll = function () {
                $scope.gridOptions.api.forEachNode(function (node) {
                    $scope.gridOptions.api.selectNode(node, false);
                });
            };


            $scope.updateStatusRows = function (status) {

                var selectedRespondentIds = [];

                $scope.gridOptions.api.getSelectedNodes().forEach(function (row) {
                    selectedRespondentIds.push(row.data.respondent_id);
                });

                var validate_promise = fieldDataService.updateStatusOfRespondents(cadastaProject.id, $stateParams.id, selectedRespondentIds, status);

                validate_promise.then(function (response) {
                    getFieldDataResponses();

                    console.log(response);

                    $scope.successMessage = 'Respondent(s) ' + response.cadasta_validate_respondent + ' have been updated.';

                    unselectAll();

                    $rootScope.$broadcast('updated-field-data');


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

                    columnDefs.push({
                        headerName: 'Respondent ID',
                        field: 'respondent_id',
                        checkboxSelection: true,
                        minWidth: 110
                    });
                    columnDefs.push({
                        headerName: 'Validated',
                        field: 'validated',
                        minWidth: 80,
                        cellClass: function (params) {
                            return (params.value === false ? 'font-red' : '');
                        }
                    });
                    columnDefs.push({
                        headerName: 'Parcel ID',
                        field: 'parcel_id',
                        minWidth: 80,
                        cellStyle: {color: '#256c97'}
                    });
                    columnDefs.push({
                        headerName: 'Party ID',
                        field: 'party_id',
                        minWidth: 80,
                        cellStyle: {color: '#256c97'}
                    });
                    columnDefs.push({
                        headerName: 'Relationship ID',
                        field: 'relationship_id',
                        minWidth: 110,
                        cellStyle: {color: '#256c97'}
                    });


                    // put colums definitions together
                    response.features[0].properties.questions.forEach(function (v) {
                        columnDefs.push({headerName: v.properties.label, field: v.properties.question_id, minWidth: 90})
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
                                qad['parcel_id'] = res.properties.parcel_id;
                                qad['party_id'] = res.properties.party_id;
                                qad['relationship_id'] = res.properties.relationship_id;
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
    }
]);
