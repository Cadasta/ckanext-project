var app = angular.module("app");

app.controller("parcelsCtrl", ['tenureTypes', 'landuseTypes', '$scope', '$state', '$stateParams', 'parcelService', 'dataService', '$rootScope', 'utilityService', 'ckanId', 'cadastaProject', '$mdDialog', '$location','sortByParcel','USER_ROLES', 'PROJECT_CRUD_ROLES', 'userRole',
    function (tenureTypes, landuseTypes, $scope, $state, $stateParams, parcelService, dataService, $rootScope, utilityService, ckanId, cadastaProject, $mdDialog, $location,sortByParcel,USER_ROLES, PROJECT_CRUD_ROLES, userRole) {

        $rootScope.$broadcast('tab-change', {tab: 'Parcels'}); // notify breadcrumbs of tab on page load

        // Add user's role to the scope
        $scope.showCRUDLink = PROJECT_CRUD_ROLES.indexOf(userRole) > -1;

        // set default pagination size
        $scope.pageSize = 20;

        $scope.projectId = cadastaProject.id;
        $scope.projectTitle = cadastaProject.title;

        $scope.$on('updated-parcel', function(e){
            getParcels($scope.pageSize, 0);
        });

        $scope.$on('new-relationship', function(e){
            getParcels($scope.pageSize, 0);
        });

        $scope.$on('updated-relationship', function(e){
            getParcels($scope.pageSize, 0);
        });

        // listen for updated field data
        $scope.$on('updated-field-data', function(e){
            getParcels($scope.pageSize, 0);
        });

        $scope.parcels = [];
        $scope.parcelsList = [];

        // update tenure type on selection
        $scope.filterTenureType = function (type) {
            $scope.TenureTypeModel = type;
        };

        $scope.sort_by = sortByParcel;

        $scope.tenure_types = tenureTypes;

        getParcels($scope.pageSize, 0);

        function getParcels(limit, offset) {
            var promise = parcelService.getProjectParcels(cadastaProject.id, limit, offset);

            promise.then(function (response) {
                var contentRange = response.headers('Content-Range');
                $scope.totalItems = parseInt(contentRange.split('/')[1]);
                //format dates
                var features = response.data.result.features;
                features.forEach(function (val) {
                    val.properties.time_created = utilityService.formatDate(val.properties.time_created);
                });

                $scope.parcels = features;

            }, function (err) {
                $scope.overviewData = "Server Error";
            });
        }

        $scope.pageChanged = function() {
            var offset = $scope.pageSize * ($scope.currentPage -1);
            getParcels($scope.pageSize, offset);
        };


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

            var map = L.map('addParcelMap', {scrollWheelZoom: false});
            $scope.map = map; // expose the map so we access it in the console for testing

            /*
            var satellite = L.tileLayer('https://api.tiles.mapbox.com/v4/mapbox.streets-satellite/{z}/{x}/{y}.png?access_token={accessToken}', {
                attribution: '',
                maxZoom: 18,
                id: 'spatialdev.map-rpljvvub',
                zoomControl: true,
                accessToken: 'pk.eyJ1Ijoic3BhdGlhbGRldiIsImEiOiJKRGYyYUlRIn0.PuYcbpuC38WO6D1r7xdMdA'
            });
            */

            var dg_satellite = L.tileLayer('https://{s}.tiles.mapbox.com/v4/digitalglobe.nal0g75k/{z}/{x}/{y}.png?access_token={accessToken}', {
                attribution: '',
                maxZoom: 18,
                zoomControl: true,
                accessToken: 'pk.eyJ1IjoiZGlnaXRhbGdsb2JlIiwiYSI6ImNpaHhtenBmZjAzYW11a2tvY2p3MnpjcGcifQ.vF1gH0mGgK31yeHC1k1Tqw'
            });

            var osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                attribution: '',
                maxZoom: 18,
                zoomControl: true
            }).addTo(map);

            /*
            var overlays = {"Mapbox Satellite": satellite, "Standard OpenStreetMap": osm};
            */

            var overlays = {"DigitalGlobe Satellite": dg_satellite, "Standard OpenStreetMap": osm};

            L.control.layers(overlays,null, {
                collapsed:true
            }).addTo(map);

            var featureGroup = L.featureGroup().addTo(map);
            var adjacentParcels = L.featureGroup().addTo(map);

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

            // show adjacent parcels on pan/zoom end
            map.on('moveend', function(e){
                adjacentParcels.clearLayers();

                // only show parcels beyond zoom level 7
                var zoom = map.getZoom();
                if (zoom < 7) return;

                var bounds = map.getBounds();
                var xmin = bounds.getWest();
                var ymin = bounds.getSouth();
                var xmax = bounds.getEast();
                var ymax = bounds.getNorth();

                var promise = parcelService.getAdjacentParcels(cadastaProject.id, zoom, xmin, ymin, xmax, ymax);
                promise.then(function(response){
                    if (response.type === 'FeatureCollection') {
                        layer = L.geoJson(response, {
                            style: {
                                "clickable" : false,
                                "color": "#6845e5",
                                "stroke": "#6845e5",
                                "stroke-width": 1,
                                "fill-opacity": .6,
                                "opacity": .8,
                                "weight":2
                            },
                        }).addTo(adjacentParcels);
                        $scope.adjacentParcels = response;
                    }
                })
            });

            var promise = dataService.getCadastaProjectDetails(cadastaProject.id);

            promise.then(function(response) {
                // If there is a project geom load map and zoom to it; else zoom to parcels

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

        function addParcelCtrl($scope, $mdDialog,  utilityService) {

            $scope.landuse_types = landuseTypes;

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
                    utilityService.showToast("Parcel Geometry is required.");
                } else {

                    var createParcel = parcelService.createProjectParcel(cadastaProject.id, layer.toGeoJSON(), $scope.parcel);

                    createParcel.then(function (response) {
                        if (response.cadasta_parcel_id){


                            $rootScope.$broadcast('new-parcel');
                            getParcels($scope.pageSize, 0);

                            $scope.cancel();
                            $state.go("tabs.parcels.parcel", {id:response.cadasta_parcel_id});
                        }
                    }).catch(function(response){
                        utilityService.showToast("Error creating new parcel");
                    });
                }
            }

        }

    }]);
