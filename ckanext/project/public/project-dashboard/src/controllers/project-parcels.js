var app = angular.module("app");

app.controller("parcelsCtrl", ['tenureTypes','$scope', '$state', '$stateParams', 'parcelService', 'dataService', '$rootScope', 'utilityService', 'ckanId', 'cadastaProject', '$mdDialog', '$location','sortByParcel','USER_ROLES', 'PROJECT_CRUD_ROLES', 'userRole',
    function (tenureTypes,$scope, $state, $stateParams, parcelService, dataService, $rootScope, utilityService, ckanId, cadastaProject, $mdDialog, $location,sortByParcel,USER_ROLES, PROJECT_CRUD_ROLES, userRole) {

        $rootScope.$broadcast('tab-change', {tab: 'Parcels'}); // notify breadcrumbs of tab on page load

        // Add user's role to the scope
        $scope.showCRUDLink = PROJECT_CRUD_ROLES.indexOf(userRole) > -1;


        $scope.$on('updated-parcel', function(e){
            getParcels();
        });

        $scope.parcels = [];
        $scope.parcelsList = [];

        // update tenure type on selection
        $scope.filterTenureType = function (type) {
            $scope.TenureTypeModel = type;
        };

        $scope.sort_by = sortByParcel;

        $scope.tenure_types = tenureTypes;

        getParcels();

        function getParcels() {
            var promise = parcelService.getProjectParcels(cadastaProject.id);

            promise.then(function (response) {

                //format dates
                response.forEach(function (val) {
                    val.properties.time_created = utilityService.formatDate(val.properties.time_created);
                });

                $scope.parcels = response;


            }, function (err) {
                $scope.overviewData = "Server Error";
            });
        }

        //modal for adding a parcel
        $scope.addParcelModal = function (ev) {
            $mdDialog.show({
                templateUrl: '/project-dashboard/src/partials/add_parcel.html',
                controller: addParcelCtrl,
                parent: angular.element(document.body),
                clickOutsideToClose: false,
                onComplete: addMap,
                locals: {cadastaProject: cadastaProject}
            })
        };


        function addMap() {

            var map = L.map('addParcelMap');
            $scope.map = map; // expose the map so we access it in the console for testing

            L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
                attribution: '',
                id: 'spatialdev.map-rpljvvub',
                zoomControl: true,
                accessToken: 'pk.eyJ1Ijoic3BhdGlhbGRldiIsImEiOiJKRGYyYUlRIn0.PuYcbpuC38WO6D1r7xdMdA#3/0.00/0.00'
            }).addTo(map);


            var featureGroup = L.featureGroup().addTo(map);

            var editIcon = L.icon({
                iconUrl: '/images/pink_marker.png',
                iconSize: [30, 30]
            });


            var options = {
                draw: {
                    marker: {
                        icon : editIcon
                    },
                    circle: false
                },
                edit: {
                    featureGroup: featureGroup
                }
            };

            var drawControl = new L.Control.Draw(options).addTo(map);

            //when a new parcel is added, save the layer to a feature group
            map.on('draw:created', function (e) {
                featureGroup.addLayer(e.layer);
                $scope.layer = e.layer;
            });

            //only allow one parcel to be drawn at a time
            map.on('draw:drawstart', function (e) {
                featureGroup.clearLayers();
            });

            var promise = dataService.getCadastaProjectDetails(cadastaProject.id);

            promise.then(function(response) {
                // If there is a project geom load map and zoom to it; else zoom to parcels
                console.log(response);
                var layer;

                var extentStyle = {
                    "color": "#256c97",
                    "stroke": "#256c97",
                    "stroke-width": 1,
                    "fill-opacity":.1,
                    "stroke-opacity":.7
                };


                if(response.features[0].geometry) {

                    var layer = L.geoJson(response.features[0], {style: extentStyle});
                    layer.addTo(map);
                }

                if(layer === undefined){
                    map.setView([19,-15],2);
                } else {
                    map.fitBounds(layer.getBounds());
                }
            });

        }

        function getLayer() {
            return $scope.layer;
        }


        function addParcelCtrl($scope, $mdDialog) {

            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.cadastaProjectId = cadastaProject.id;

            $scope.saveNewParcel = function () {

                var layer = getLayer();

                if (layer === undefined) {
                    $scope.parcelCreated = "parcel geometry is required";
                } else {

                    var createParcel = parcelService.createProjectParcel(cadastaProject.id, layer.toGeoJSON(), $scope.parcel);

                    createParcel.then(function (response) {
                        if (response.cadasta_parcel_id){


                            $rootScope.$broadcast('new-parcel');
                            getParcels();

                            var timeoutID = window.setTimeout(function() {
                                    $scope.cancel();
                                    $state.go("tabs.parcels.parcel", {id:response.cadasta_parcel_id})
                                }, 300);
                        }
                    }).catch(function(err){

                        $scope.parcelCreated ='unable to create parcel';
                    });
                }
            }

        }

    }]);