var app = angular.module("app");

app.controller("relationshipsCtrl", ['tenureTypes','$scope', '$state', '$stateParams', 'relationshipService', '$rootScope', 'utilityService', 'ckanId', 'cadastaProject', '$mdDialog','sortByRelationship', 'partyService', 'dataService',
    function (tenureTypes, $scope, $state, $stateParams, relationshipService, $rootScope, utilityService, ckanId, cadastaProject, $mdDialog, sortByRelationship, partyService, dataService) {

        $rootScope.$broadcast('tab-change', {tab: 'Relationships'}); // notify breadcrumbs of tab on page load

        $scope.relationships = [];
        $scope.relationshipsList = [];

        // update tenure type on selection
        $scope.setRelationshipFilter = function (type){
            $scope.relationshipFilter = type;
        };

        // set pagination page size
        $scope.pageSize = 20;

        getRelationships($scope.pageSize, 0);

        function getRelationships(limit, offset) {

            var promise = relationshipService.getProjectRelationshipsList(cadastaProject.id, limit, offset);

            promise.then(function (response) {
                var contentRange = response.headers('Content-Range');
                $scope.totalItems = parseInt(contentRange.split('/')[1]);
                //format dates
                var features = response.data.result.features;
                features.forEach(function (val) {
                    val.properties.time_created = utilityService.formatDate(val.properties.time_created);
                    if (val.properties.acquired_date) {
                        val.properties.acquired_dateDMY = utilityService.formatDate(val.properties.acquired_date);
                    }
                });

                $scope.relationships = features;

            }, function (err) {
                $scope.overviewData = "Server Error";
            });

        }

        $scope.pageChanged = function() {
            var offset = $scope.pageSize * ($scope.currentPage -1);
            getRelationships($scope.pageSize, offset);
        };

        // listen for updated field data
        $scope.$on('updated-field-data', function(e){
            getRelationships($scope.pageSize, 0);
        });

        // listen for updates relationship
        $scope.$on('updated-relationship', function (){
            getRelationships($scope.pageSize, 0);
        });

        // listen for new relationships
        $scope.$on('new-relationship', function (){
            getRelationships($scope.pageSize, 0);
        });

        //modal for adding a relationship
        $scope.addRelationshipModal = function (ev) {
            $mdDialog.show({
                templateUrl: '/project-dashboard/src/partials/add_relationship.html',
                controller: addRelationshipCtrl,
                parent: angular.element(document.body),
                clickOutsideToClose: false,
                onComplete: addMap,
                locals: {cadastaProject: cadastaProject}
            })
        };


        function addMap() {

            var map = L.map('addRelationshipMap');

            var layer;

            L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
                attribution: '',
                id: 'spatialdev.map-rpljvvub',
                accessToken: 'pk.eyJ1Ijoic3BhdGlhbGRldiIsImEiOiJKRGYyYUlRIn0.PuYcbpuC38WO6D1r7xdMdA#3/0.00/0.00'
            }).addTo(map);

            //add layer for adding parcels
            var parcelGroup = L.featureGroup().addTo(map);

            var promise = parcelService.getProjectParcel(cadastaProject.id, $stateParams.id);

            promise.then(function (response) {


                $scope.parcel = response.properties;
                $scope.parcelObject = response;


                // If there are any parcels, load the map and zoom to parcel
                if (response.geometry) {
                    layer = L.geoJson(response, {
                        style: parcelStyle,
                        pointToLayer: function (feature, latlng) {
                            return L.circle(latlng, 10, {"fillOpacity":.7, "opacity":.7, "weight":0} );
                        }
                    }).addTo(parcelGroup);
                    map.fitBounds(layer.getBounds());
                } else {
                    map.setView([0, 0], 3);
                }

            }, function (err) {
                $scope.overviewData = "Server Error";
            });
        }


        function addRelationshipCtrl($scope, $mdDialog, $stateParams) {
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.cadastaProjectId = cadastaProject.id;
            $scope.relationship = {};

            $scope.selectParty = function(party) {
                $scope.relationship.party = party;
            }


            var promise = partyService.getProjectParties(cadastaProject.id);

            promise.then(function (response) {
                $scope.parties = response;

            }, function (err) {
                $scope.parties = "Server Error";
            });


            $scope.tenure_types = tenureTypes;
        }


        $scope.sort_by = sortByRelationship;

        $scope.tenure_types = tenureTypes;


    }]);

// replace null with '-' for table
app.filter('emptyString', function (){
    return function(input){
        return input == null ? '-': input;
    }
});
