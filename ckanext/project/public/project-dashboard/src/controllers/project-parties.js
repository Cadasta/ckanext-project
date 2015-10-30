var app = angular.module("app");

app.controller("partiesCtrl", ['$scope', '$state', '$stateParams', 'partyService', '$rootScope', 'utilityService', 'ckanId', 'cadastaProject', '$mdDialog','sortByParty',
    function ($scope, $state, $stateParams, partyService, $rootScope, utilityService, ckanId, cadastaProject, $mdDialog, sortByParty) {

        $rootScope.$broadcast('tab-change', {tab: 'Parties'}); // notify breadcrumbs of tab on page load

        $scope.parties = [];
        $scope.partiesList = [];

        // update party type on selection
        $scope.filterPartyType = function (type) {
            $scope.PartyTypeModel = type;
        };


        getParties();

        function getParties() {
            var promise = partyService.getProjectParties(cadastaProject.id);

            promise.then(function (response) {

                //format dates
                response.forEach(function (val) {
                    val.properties.time_created = utilityService.formatDate(val.properties.time_created);
                })

                $scope.parties = response;


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


        function addPartyCtrl($scope, $mdDialog, $stateParams) {
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.cadastaProjectId = cadastaProject.id;

            $scope.saveNewParty = function(projectId, party){

                var createParty = partyService.createProjectParty(projectId, party);

                createParty.then(function (response) {
                    if (response.cadasta_party_id){

                        $scope.partyCreated = 'party successfully added';

                        $rootScope.$broadcast('new-party');
                        getParties();

                        var timeoutID = window.setTimeout(function() {
                            $scope.cancel();
                            $state.go("tabs.parties.party", {id:response.cadasta_party_id})
                        }, 300);
                    }
                }).catch(function(err){

                    $scope.partyCreated ='unable to create party';
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
