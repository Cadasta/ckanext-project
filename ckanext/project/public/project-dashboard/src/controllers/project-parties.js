var app = angular.module("app");

app.controller("partiesCtrl", ['partyTypes','$scope', '$state', '$stateParams', 'partyService', '$rootScope', 'utilityService', 'ckanId', 'cadastaProject', '$mdDialog','sortByParty', 'USER_ROLES', 'PROJECT_CRUD_ROLES', 'userRole',
    function (partyTypes,$scope, $state, $stateParams, partyService, $rootScope, utilityService, ckanId, cadastaProject, $mdDialog, sortByParty, USER_ROLES, PROJECT_CRUD_ROLES, userRole) {

        // Add user's role to the scope
        $scope.showCRUDLink = PROJECT_CRUD_ROLES.indexOf(userRole) > -1;

        $rootScope.$broadcast('tab-change', {tab: 'Parties'}); // notify breadcrumbs of tab on page load

        // listen for updated party, then go and get updated data from api
        $scope.$on('updated-party', function(){
            getParties();
        });

        $scope.parties = [];
        $scope.partiesList = [];

        // update party type on selection
        $scope.filterPartyType = function (type) {
            $scope.PartyTypeModel = type;
        };

        var columnDefs = [
            {headerName:"Validated", field:"validated"},
            {headerName: "Party ID", field: "id"},
            {headerName: "Name", field: "party_name"},
            {headerName: "Party Type", field: "type"},
            {headerName: "Active Relationships", field: "num_relationships"},
            {headerName: "Date Created", field: "time_created"}
        ];


        $scope.partyGridOptions = {
            columnDefs: columnDefs,
            rowData: [],
            enableSorting: true,
            rowSelection: 'single',
            rowHeight:50,
            headerHeight:37,
            onRowSelected: rowSelectedFunc

        };

        function rowSelectedFunc(event) {
            $state.go("tabs.parties.party", {id:event.node.data.id})
        }

        // listen for updated field data
        $scope.$on('updated-field-data', function(e){
            getParties();
        });

        // set pagination page size
        $scope.pageSize = 20;

        getParties($scope.pageSize, 0);

        function getParties(limit, offset) {
            var promise = partyService.getProjectParties(cadastaProject.id, limit, offset);

            promise.then(function (response) {
                var contentRange = response.headers('Content-Range');
                $scope.totalItems = parseInt(contentRange.split('/')[1]);
                //format dates
                var features = response.data.result.features;

                //format dates
                features.forEach(function (val) {
                    val.properties.time_created = utilityService.formatDate(val.properties.time_created);
                })

                $scope.parties = features;

                var partyData = [];

                //get row data
                features.forEach(function (party) {

                    // set validated to string for ag-grid searching
                    party.properties.validated = party.properties.validated.toString();

                    if (party.properties.group_name){
                        party.properties.party_name = party.properties.group_name;
                    }
                    else {
                        party.properties.party_name = party.properties.full_name;
                    }
                    partyData.push(party.properties);
                });


                // add data to column rows
                $scope.partyGridOptions.api.setRowData(partyData);
                $scope.partyGridOptions.api.sizeColumnsToFit();


            }, function (err) {
                $scope.parties = "Server Error";
            });
        }

        $scope.pageChanged = function() {
            var offset = $scope.pageSize * ($scope.currentPage -1);
            getParties($scope.pageSize, offset);
        };



        //modal for adding a parcel
        $scope.addPartyModal = function (ev) {
            $mdDialog.show({
                templateUrl: '/project-dashboard/src/partials/add_party.html',
                controller: addPartyCtrl,
                parent: angular.element(document.body),
                clickOutsideToClose: false,
                locals: {cadastaProject: cadastaProject}
            })
        };


        $scope.partyCreatedFeedback = '';
        $scope.showDatepicker = false;

        function addPartyCtrl($scope, $mdDialog, $stateParams, utilityService) {
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
            $scope.cadastaProjectId = cadastaProject.id;

            $scope.maxDate = new Date();
            $scope.format = 'dd/MM/yyyy';

            $scope.clearPartyFields = function(party){
                $scope.party = {"party_type": party.party_type};
            };

            $scope.saveNewParty = function(projectId, party){

                if($scope.dt && $scope.showDatepicker){
                    party.dob =  new Date($scope.dt.setMinutes( $scope.dt.getTimezoneOffset() ));
                }

                if($scope.party.party_type == 'group' && $scope.party.group_name == undefined){
                    utilityService.showToast('Group Name is required.');
                }

                else if ($scope.party.party_type == 'individual' && $scope.party.full_name  == undefined){
                    utilityService.showToast('Name is required.');
                }
                var createParty = partyService.createProjectParty(projectId, party);

                createParty.then(function (response) {
                    if (response.cadasta_party_id){

                        $rootScope.$broadcast('new-party');
                        getParties();

                        $scope.cancel();
                        $state.go("tabs.parties.party", {id:response.cadasta_party_id});
                    }
                }).catch(function(response){
                    utilityService.showToast('Unable to create party');
                });
            }
        }

        $scope.cancel = function() {
            $mdDialog.cancel();
        };

        $scope.sort_by = sortByParty;

        $scope.party_types = partyTypes;

    }]);
