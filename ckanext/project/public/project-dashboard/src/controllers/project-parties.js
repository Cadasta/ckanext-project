var app = angular.module("app");

app.controller("partiesCtrl", ['$scope', '$state', '$stateParams', 'partyService', '$rootScope', 'utilityService', 'ckanId', 'cadastaProject', '$mdDialog','sortByParty', 'USER_ROLES', 'PROJECT_CRUD_ROLES', 'userRole',
    function ($scope, $state, $stateParams, partyService, $rootScope, utilityService, ckanId, cadastaProject, $mdDialog, sortByParty, USER_ROLES, PROJECT_CRUD_ROLES, userRole) {

        // Add user's role to the scope
        $scope.showCRUDLink = PROJECT_CRUD_ROLES.indexOf(userRole) > -1;

        $rootScope.$broadcast('tab-change', {tab: 'Parties'}); // notify breadcrumbs of tab on page load

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


        getParties();

        function getParties() {
            var promise = partyService.getProjectParties(cadastaProject.id);

            promise.then(function (response) {

                //format dates
                response.forEach(function (val) {
                    val.properties.time_created = utilityService.formatDate(val.properties.time_created);
                })

                $scope.parties = response;

                var partyData = [];


                //get row data
                response.forEach(function (party) {

                    // set validated to string for ag-grid searching
                    party.properties.validated = party.properties.validated.toString();

                    if (party.properties.group_name){
                        party.properties.party_name = party.properties.group_name;
                    }
                    else {
                        party.properties.party_name = party.properties.full_name;
                    }
                    partyData.push(party.properties);
                    console.log(partyData);
                });



                // add data to column rows
                $scope.partyGridOptions.api.setRowData(partyData);
                $scope.partyGridOptions.api.sizeColumnsToFit();



            }, function (err) {
                $scope.parties = "Server Error";
            });
        }



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

        function addPartyCtrl($scope, $mdDialog, $stateParams) {
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
            $scope.cadastaProjectId = cadastaProject.id;

            $scope.maxDate = new Date();
            $scope.format = 'dd/MM/yyyy';

            $scope.saveNewParty = function(projectId, party){

                if($scope.dt){
                    party.dob =  new Date($scope.dt.setMinutes( $scope.dt.getTimezoneOffset() ));
                }

                var createParty = partyService.createProjectParty(projectId, party);

                createParty.then(function (response) {
                    if (response.cadasta_party_id){

                        $scope.partyCreatedFeedback = 'Party successfully added';

                        $rootScope.$broadcast('new-party');
                        getParties();

                        $scope.cancel();
                        $state.go("tabs.parties.party", {id:response.cadasta_party_id});
                    }
                }).catch(function(response){

                    $scope.partyCreatedFeedback ='Unable to create party: ' + response.data.error.message;
                });
            }
        }

        $scope.cancel = function() {
            $mdDialog.cancel();
        };


        $scope.sort_by = sortByParty;

        $scope.party_types = [
            {
                type: 'all',
                label: 'All Types'
            },
            {
                type: 'individual',
                label: 'Individuals'
            },
            {
                type: 'group',
                label: 'Groups'
            }
        ];


    }]);

// replace null with '-' for table
app.filter('emptyString', function (){
    return function(input){
        return input == null ? '-': input;
    }
});
