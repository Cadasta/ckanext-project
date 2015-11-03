app.controller("parcelCtrl", ['$scope', '$state', '$stateParams', 'parcelService', '$rootScope', 'paramService', 'utilityService', 'uploadResourceService', 'dataService', '$mdDialog', 'ckanId', 'cadastaProject', 'FileUploader', 'ENV', 'partyService', 'relationshipService',
    function ($scope, $state, $stateParams, parcelService, $rootScope, paramService, utilityService, uploadResourceService, dataService, $mdDialog, ckanId, cadastaProject, FileUploader, ENV, partyService, relationshipService) {


        var mapStr = $stateParams.map;

        $rootScope.$broadcast('tab-change', {tab: 'Parcels'}); // notify breadcrumbs of tab on page load

        // parse map query param
        var mapArr = mapStr.substring(1, mapStr.length - 1).split(',');


        var parcelStyle = {
            "color": "#e54573",
            "stroke": "#e54573",
            "weight": 1,
            "fillOpacity": .5,
            "opacity": .8,
            "marker-color": "#e54573"
        };


        var relationshipStyle = {
            "color": "#FF8000",
            "stroke": "#FF8000",
            "opacity":.8,
            "fillOpacity":.5,
            "weight" : 1
        };

        getParcelResources();

        var lat = mapArr[0];
        var lng = mapArr[1];
        var zoom = mapArr[2];

        // setup map
        var map = L.map('parcelDetailsMap', {scrollWheelZoom: false});

        // After each pan or zoom
        map.on('moveend', function () {

            if ($state.current.name !== 'tabs.parcels.parcel') {
                return;
            }

            var center = map.getCenter();
            var zoom = map.getZoom();
            var param = '(' + [center.lat, center.lng, zoom].join(',') + ')';
            $stateParams.map = param;
            paramService.setStateParam($state.current.name, 'map', param);
            $state.go($state.current.name, $stateParams, {notify: false});
        });

        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
            attribution: '',
            id: 'spatialdev.map-rpljvvub',
            accessToken: 'pk.eyJ1Ijoic3BhdGlhbGRldiIsImEiOiJKRGYyYUlRIn0.PuYcbpuC38WO6D1r7xdMdA#3/0.00/0.00'
        }).addTo(map);

        $scope.parcel = {};

        $scope.toggleDropdownDetails = function (obj) {
            obj.showDropDownDetails = !obj.showDropDownDetails;
        };

        $scope.clearParcelBreadCrumb = function () {
            $rootScope.$broadcast('clear-inner-tabs');
        };

        //add layer for adding parcels
        var parcelGroup = L.featureGroup().addTo(map);

        //layer for adding relationships
        var relationshipGroup = L.featureGroup().addTo(map);


        getParcelDetails();


        function getParcelDetails() {

            var layer;

            var promise = parcelService.getProjectParcel(cadastaProject.id, $stateParams.id);

            promise.then(function (response) {

                $rootScope.$broadcast('parcel-details', {id: $stateParams.id});

                $scope.parcel = response.properties;
                $scope.parcelObject = response;

                // format dates
                $scope.parcel.time_created = utilityService.formatDate($scope.parcel.time_created);
                $scope.parcel.time_updated = utilityService.formatDate($scope.parcel.time_created);

                //reformat parcel history dates
                response.properties.parcel_history.forEach(function (val) {
                    val.properties.time_created = utilityService.formatDate(val.properties.time_created);
                    val.properties.time_updated = utilityService.formatDate(val.properties.time_updated);
                });

                //reformat relationship dates
                response.properties.relationships.forEach(function (val) {
                    val.properties.time_created = utilityService.formatDate(val.properties.time_created);
                    val.properties.time_updated = utilityService.formatDate(val.properties.time_updated);
                });

                $scope.parcel_history = response.properties.parcel_history;

                $scope.relationships = response.properties.relationships;

                relationshipGroup.clearLayers();
                parcelGroup.clearLayers();

                //update values for UI
                $scope.relationships.forEach(function (v, i) {

                    var popup_content = '<h3>Relationship ' + v.properties.id + '</h3><a ui-sref="tabs.relationships{id: ' + v.properties.id + '}"> See Full Details<i class="material-icons arrow-forward">arrow_forward</i></a>';


                    if(v.geometry !== null){
                        layer = L.geoJson(v, {style: relationshipStyle});
                        layer.bindPopup(popup_content);
                        layer.addTo(relationshipGroup);
                        map.fitBounds(layer.getBounds());
                    }


                    v.showDropDownDetails = (i === 0);

                    v.properties.active = v.properties.active ? 'Active' : 'Inactive';
                    v.properties.relationship_type = 'own' ? 'Owner' : v.properties.relationship_type;

                });

                // If there are any parcels, load the map and zoom to parcel
                if (response.geometry) {
                    layer = L.geoJson(response, {style: parcelStyle}).addTo(parcelGroup);
                    map.fitBounds(layer.getBounds());
                } else {
                    map.setView([lat, lng], zoom);
                }

                return parcelService.getProjectParcelRelationshipHistory(cadastaProject.id, $stateParams.id);

            }, function (err) {
                $scope.overviewData = "Server Error";
            });
        }

        function getParcelResources() {
            var resource_promise = parcelService.getProjectParcelResources(cadastaProject.id, $stateParams.id);

            resource_promise.then(function (response) {

                $scope.parcelResources = response;

                //reformat date created of resources
                $scope.parcelResources.features.forEach(function (resource) {
                    resource.properties.time_created = utilityService.formatDate(resource.properties.time_created);
                });

            }, function (err) {
                $scope.overviewData = "Server Error";
            });

        }

        $scope.response = '';
        $scope.error = '';
        $scope.progress = 0;


        /**
         * Functions related to the update parcel modal
         * @returns {*}
         */

            //modal for adding a parcel
        $scope.updateParcelModal = function (ev) {
            $mdDialog.show({
                templateUrl: '/project-dashboard/src/partials/edit_parcel.html',
                controller: updateParcelCtrl,
                parent: angular.element(document.body),
                clickOutsideToClose: false,
                onComplete: addMap,
                locals: {cadastaProject: cadastaProject, parcel:$scope.parcel}
            })
        };

        function getLayer() {
            return $scope.layer;
        }

        function updateParcelCtrl($scope, $mdDialog, $stateParams, parcel, cadastaProject) {
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.cadastaProjectId = cadastaProject.id;
            $scope.parcel = parcel;

            $scope.updateParcel = function (projectId) {

                var layer = getLayer();

                if (layer === undefined) {
                    layer = null;
                } else {
                    layer = layer.toGeoJSON();
                }
                var updateExistingParcel = parcelService.updateProjectParcel(cadastaProject.id, $stateParams.id, layer, $scope.parcel);

                updateExistingParcel.then(function (response) {
                    if (response.cadata_parcel_history_id){

                        $scope.parcelCreated = 'parcel successfully updated';

                        $rootScope.$broadcast('updated-parcel');

                        getParcelDetails();

                        var timeoutID = window.setTimeout(function() {
                            $scope.cancel();
                        }, 300);
                    }
                }).catch(function(err){

                    $scope.parcelCreated ='unable to update parcel';
                });

            }
        }



        /**
         * Functions related to add relationship modal
         * @returns {*}
         */

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


            $scope.saveNewRelationship = function () {

                var layer = getLayer();

                if (layer) {
                    layer = layer.toGeoJSON().geometry;
                }

                if ($scope.relationship.party == undefined) {
                    $scope.relationshipCreated = "party required";
                }
                else if ($scope.relationship.tenure_type == undefined) {
                    $scope.relationshipCreated = "tenure required";
                }
                else if (($scope.relationship.party != undefined) && ($scope.relationship.tenure_type != undefined)  ) {

                    var createRelationship = relationshipService.createProjectRelationship(cadastaProject.id, $stateParams.id, layer, $scope.relationship);

                    createRelationship.then(function (response) {
                        if (response.cadasta_relationship_id){


                            $rootScope.$broadcast('new-relationship');
                            getParcelDetails();

                            var timeoutID = window.setTimeout(function() {
                                $scope.cancel();
                            }, 300);
                        }
                    }).catch(function(err){

                        $scope.parcelCreated ='unable to create parcel';
                    });

                }
            }

            $scope.tenure_types = [
                {
                    type: 'own',
                    label: 'Own'
                },
                {
                    type: 'lease',
                    label: 'Lease'
                },
                {
                    type: 'occupy',
                    label: 'Occupy'
                },
                {
                    type: 'informal occupy',
                    label: 'Informally Occupy'
                }
            ];
        }

        function addMap(map) {

            var map = L.map('editParcelMap');

            L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
                attribution: '',
                id: 'spatialdev.map-rpljvvub',
                zoomControl: true,
                accessToken: 'pk.eyJ1Ijoic3BhdGlhbGRldiIsImEiOiJKRGYyYUlRIn0.PuYcbpuC38WO6D1r7xdMdA#3/0.00/0.00'
            }).addTo(map);


            var featureGroup = L.featureGroup().addTo(map);


            var editIcon = L.icon({
                iconUrl: '/images/orange_marker.png',
                iconSize: [30, 30]

            });


            var options = {
                draw: {
                    polyline: {
                        shapeOptions: {
                            "color": "#88D40E",
                            "stroke": "#88D40E",
                            "stroke-width": 1,
                            "fill-opacity":.7,
                            "stroke-opacity":.8
                        }
                    },
                    polygon: {
                        shapeOptions: {
                            "color": "#88D40E",
                            "stroke": "#88D40E",
                            "stroke-width": 1,
                            "fill-opacity":.7,
                            "stroke-opacity":.8
                        }
                    },
                    circle: false,
                    rectangle: {
                        shapeOptions: {
                            "color": "#88D40E",
                            "stroke": "#88D40E",
                            "stroke-width": 1,
                            "fill-opacity":.7,
                            "stroke-opacity":.8
                        }
                    },
                    marker: {
                        icon : editIcon
                    }
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


            //add project extent to the map
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
                    layer.addTo(parcelGroup);
                }

            });

            var parcelStyle = {
                "color": "#e54573",
                "stroke": "#e54573",
                "stroke-width": 1,
                "fill-opacity":.8,
                "stroke-opacity":.8,
                "marker-color":"#e54573"
            };

            //add parcel extent to the map
            var parcelLayer = L.geoJson($scope.parcelObject, {style: parcelStyle});

            parcelLayer.addTo(map);

            map.fitBounds(parcelLayer.getBounds());


            //prepopulate fields to update with existing data
            $scope.parcel.pinid = $scope.parcelObject.properties.gov_pin;
            $scope.parcel.landuse = $scope.parcelObject.properties.land_use;


        }


        /**
         * Functions related to add parcel resources modal
         * @returns {*}
         */

        $scope.showAddResourceModal = function (ev) {

            $mdDialog.show({
                controller: resourceDialogController,
                templateUrl: '/project-dashboard/src/partials/data_upload.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            })
        };

        function resourceDialogController($scope, $mdDialog, FileUploader, ENV) {
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
            $scope.answer = function (answer) {
                $mdDialog.hide(answer);
            };

            $scope.uploader = new FileUploader({
                alias: 'filedata',
                url: ENV.apiCadastaRoot + '/projects/' + cadastaProject.id + '/parcel/' + $stateParams.id + '/resources'
            });

            $scope.uploader.onProgressItem = function (item, progress) {
                $scope.progress = progress;
            };

            // triggered when FileItem is has completed .upload()
            $scope.uploader.onCompleteItem = function (fileItem, response, status, headers) {
                if (response.message == "Success") {
                    $scope.response = 'File Successfully uploaded.';
                    $scope.error = ''; // clear error
                    $scope.uploader.clearQueue();

                    getParcelResources();
                    $rootScope.$broadcast('new-resource'); // broadcast new resources to the app
                }
            };

            $scope.uploader.onAfterAddingFile = function () {
                //remove previous item from queue
                if ($scope.uploader.queue.length > 1) {
                    $scope.uploader.removeFromQueue(0);
                }
            };

            $scope.uploader.onErrorItem = function (item, response, status, headers) {
                if (response.type == "duplicate") {
                    $scope.error = 'This resource already exists. Rename resource to complete upload.'
                } else {
                    $scope.error = response.error;
                }

                $scope.uploader.clearQueue();
            };

        }

        $scope.tenure_types = [

            {
                type: 'own',
                label: 'Owned Parcels'
            },
            {
                type: 'lease',
                label: 'Leased Parcels'
            },
            {
                type: 'occupy',
                label: 'Occupied Parcels'
            },
            {
                type: 'informal occupy',
                label: 'Informally Occupied Parcels'
            }
        ];


        $scope.myDate = new Date();

    }]);


// replace null with '-' for table
app.filter('emptyString', function () {
    return function (input) {
        return input == null ? '- -' : input;
    }
});
