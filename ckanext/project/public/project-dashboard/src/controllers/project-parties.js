var app = angular.module("app");

app.controller("partiesCtrl", ['$scope', '$state', '$stateParams', 'partyService', '$rootScope', 'utilityService', 'ckanId', 'cadastaProject', '$mdDialog','sortByParcel',
    function ($scope, $state, $stateParams, partyService, $rootScope, utilityService, ckanId, cadastaProject, $mdDialog, sortByParcel) {

        $rootScope.$broadcast('tab-change', {tab: 'Parties'}); // notify breadcrumbs of tab on page load

        $scope.parties = [];
        $scope.partiesList = [];

        // update party type on selection
        $scope.filterPartyType = function (type) {
            $scope.PartyTypeModel = type;
        };

        $scope.sort_by = sortByParcel;

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

        $scope.sort_by = [
            {
                label: 'None',
                type: 'all'
            },
            {
                label: 'Party ID',
                type: 'id'
            },
            {
                label: 'Name',
                type: 'first_name'
            },
            {
                label: 'Party Type',
                type: 'type'
            },
            {
                label: 'Active Relationships',
                type: 'num_relationships'
            },
            {
                label: 'Date Created',
                type: 'time_created'
            }
        ];

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


//// custom tenure type filter
//app.filter('tenureType', function () {
//    return function(inputs,filter_type) {
//        var output = [];
//        switch(filter_type){
//            case 'own':
//            case 'lease':
//            case 'occupy':
//            case 'informal occupy':
//                //check if array contains filter selection
//                inputs.forEach(function (input,i) {
//                    if (input.properties.tenure_type.indexOf(filter_type) !== -1) {
//                        output.push(input);
//                    }
//                });
//
//                return output;
//                break;
//            case 'date_acquired':
//                // create unique copy of array
//                var arr = inputs.slice();
//                // sort by date DESC
//                arr.sort(function(a,b){
//                    var a_date = new Date(a.properties.acquired_date);
//                    var b_date = new Date(b.properties.acquired_date);
//                    return   b_date - a_date;
//                });
//                return arr;
//                break;
//            case 'num_parties':
//                var arr = inputs.slice();
//                // sort by DESC
//                arr.sort(function(a,b){
//                    return b.properties[filter_type] - a.properties[filter_type];
//                });
//                return arr;
//                break;
//            case 'id':
//                // sort by ASC
//                var arr = inputs.slice();
//                arr.sort(function(a,b){
//                    return a.properties[filter_type] - b.properties[filter_type];
//                });
//                return arr;
//                break;
//            default:
//                return inputs;
//        }
//    };
//});
