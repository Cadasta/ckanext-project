app.controller("partyCtrl", ['$scope', '$state', '$stateParams','partyService','$rootScope','paramService', 'utilityService', 'uploadResourceService', '$mdDialog', 'ckanId', 'cadastaProject', 'FileUploader', 'ENV', 'dataService', 'relationshipService', 'parcelService',
    function($scope, $state, $stateParams, partyService,$rootScope,paramService, utilityService, uploadResourceService, $mdDialog, ckanId, cadastaProject, FileUploader, ENV, dataService, relationshipService, parcelService){


        $rootScope.$broadcast('tab-change', {tab: 'Parties'}); // notify breadcrumbs of tab on page load

        $rootScope.$broadcast('party-details', {id: $stateParams.id});

        $scope.clearPartyBreadCrumb = function () {
            $rootScope.$broadcast('clear-inner-party-tab');
        };

        $scope.toggleDropdownDetails = function (obj) {
            obj.showDropDownDetails = !obj.showDropDownDetails;
        };

        $scope.relationshipParcelId = null;

        var mapStr = $stateParams.map;

        // parse map query param
        var mapArr = mapStr.substring(1, mapStr.length - 1).split(',');


        var parcelStyle = {
            "color": "#e54573",
            "stroke": true,
            "weight": 3,
            "fillOpacity": .1,
            "opacity": .8,
            "marker-color": "#e54573",
            "clickable":false
        };

        var relationshipStyle = {
            "color": "#FF8000",
            "stroke": true,
            "opacity":.5,
            "fillOpacity":.5,
            "weight" : 1
        };

        var lat = mapArr[0];
        var lng = mapArr[1];
        var zoom = mapArr[2];

        // setup map
        var map = L.map('partyDetailsMap', {scrollWheelZoom: false});

        // After each pan or zoom
        map.on('moveend', function () {

            if ($state.current.name !== 'tabs.parties.party') {
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

        //add layer for adding parcels
        var parcelGroup = L.featureGroup().addTo(map);
        var relationshipGroup = L.featureGroup().addTo(map);


        getPartyDetails ();
        getPartyResources();

        function getPartyDetails () {

            var layer;

            var promise = partyService.getProjectParty(cadastaProject.id, $stateParams.id);

            promise.then(function (response) {

                $rootScope.$broadcast('party-details', {id: $stateParams.id});

                $scope.party = response.properties;

                parcelGroup.clearLayers();
                relationshipGroup.clearLayers();

                //// format dates
                $scope.party.time_created = utilityService.formatDate($scope.party.time_created);
                $scope.party.time_updated = utilityService.formatDate($scope.party.time_created);

                if (response.properties.relationships.length > 0){
                    response.properties.relationships.forEach(function (val) {
                        ////reformat relationship dates
                        val.properties.time_created = utilityService.formatDate(val.properties.time_created);
                        val.properties.time_updated = utilityService.formatDate(val.properties.time_updated);

                        //create popup for relationship
                        var name = null;
                        if (val.properties.first_name) {
                            name = val.properties.first_name;
                        } else {
                            name = val.properties.group_name;
                        }
                        var popup_content = '<h3>Relationship ' + val.properties.id + '</h3><p class="popup-text">Tenure Type:' + val.properties.tenure_type + ' </p><p class="popup-text">Party: ' + name + '</p><a href="#/relationships/' + val.properties.id + '"> See Full Details<i class="material-icons arrow-forward">arrow_forward</i></a>';


                        // add relationship geometries to map
                        if(val.geometry !== null){
                            layer = L.geoJson(val, {style: relationshipStyle});
                            layer.bindPopup(popup_content);
                            layer.addTo(parcelGroup);
                            map.fitBounds(parcelGroup.getBounds());
                        }
                    })
                }


                var parcels = response.properties.parcels;

                // add parcel geometries to map
                if(parcels.length>0){
                    parcels.forEach(function(p){
                        if (p.geometry !== null){
                            layer = L.geoJson(p, {style: parcelStyle});
                            layer.addTo(parcelGroup);
                            map.fitBounds(parcelGroup.getBounds());
                        }
                    })
                } else {
                    map.setView([lat, lng], zoom); // set bounds to default if no parcels
                }

                $scope.relationships = response.properties.relationships;
                $scope.relationship_history = response.properties.relationship_history;

            }, function (err) {
                $scope.partyDetails = "Server Error";
            });
        }

        function getPartyResources() {
            var resource_promise = partyService.getProjectPartyResources(cadastaProject.id, $stateParams.id);

            resource_promise.then(function (response) {

                $scope.partyResources = response;

                //reformat date created of resources
                $scope.partyResources.features.forEach(function (resource) {
                    resource.properties.time_created = utilityService.formatDate(resource.properties.time_created);
                });

            }, function (err) {
                $scope.partyResources = "Server Error";
            });

        }


        /**
         * Functions related to add resource modal
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

            $scope.uploader = new FileUploader({
                alias: 'filedata',
                url: ENV.apiCadastaRoot + '/projects/' + cadastaProject.id + '/party/' + $stateParams.id + '/resources'
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

                    getPartyResources();
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



        /**
         * Functions related to add relationship modal
         * @returns {*}
         */

            //modal for adding a relationship
        $scope.addRelationshipModal = function (ev) {
            $mdDialog.show({
                templateUrl: '/project-dashboard/src/partials/add_relationship_from_party.html',
                controller: addRelationshipCtrl,
                parent: angular.element(document.body),
                clickOutsideToClose: false,
                onComplete: addMap,
                locals: {cadastaProject: cadastaProject}
            })
        };


        function getLayer() {
            return $scope.layer;
        }

        function getRelationshipParcelId() {
            return $scope.relationshipParcelId;
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

            $scope.relationship.party = {};
            $scope.relationship.party.properties = {};
            $scope.relationship.party.properties.id = $stateParams.id;

            $scope.saveNewRelationship = function () {

                var layer = getLayer();

                if (layer) {
                    layer = layer.toGeoJSON().geometry;
                }

                var relationshipParcelId = getRelationshipParcelId();

                if (relationshipParcelId == undefined) {
                    $scope.relationshipCreated = "parcel required";
                }
                else if ($scope.relationship.tenure_type == undefined) {
                    $scope.relationshipCreated = "tenure required";
                }
                else if ((relationshipParcelId != undefined) && ($scope.relationship.tenure_type != undefined)  ) {

                    var createRelationship = relationshipService.createProjectRelationship(cadastaProject.id, relationshipParcelId, layer, $scope.relationship);

                    createRelationship.then(function (response) {
                        if (response.cadasta_relationship_id){


                            $rootScope.$broadcast('new-relationship');
                            getPartyDetails ();


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
            var parcelGroup = L.featureGroup().addTo(map);


            var editIcon = L.icon({
                iconUrl: '/images/orange_marker.png',
                iconSize: [30, 30]
            });

            var options = {
                draw: {
                    polyline: {
                        shapeOptions: {
                            "color": "#88D40E",
                            "stroke": true,
                            "stroke-width": 1,
                            "fill-opacity":.7,
                            "stroke-opacity":.8
                        }
                    },
                    polygon: {
                        shapeOptions: {
                            "color": "#88D40E",
                            "stroke": true,
                            "stroke-width": 1,
                            "fill-opacity":.7,
                            "stroke-opacity":.8
                        }
                    },
                    circle: false,
                    rectangle: {
                        shapeOptions: {
                            "color": "#88D40E",
                            "stroke": true,
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

            var extentStyle = {
                "color": "#256c97",
                "stroke": true,
                "stroke-width": 1,
                "fill-opacity":.1,
                "stroke-opacity":.7,
                "clickable" : false
            };

            var parcelStyle = {
                "color": "#e54573",
                "stroke": "#e54573",
                "stroke-width": 3,
                "fill-opacity":.1,
                "stroke-opacity":.8,
                "marker-color":"#e54573"
            };

            var selectStyle = {
                "color": "#6324C3",
                "stroke": true,
                "stroke-width": 3,
                "fill-opacity":.1,
                "stroke-opacity":.8,
                "marker-color":"#e54573"
            };

            var selectParcel = function(parcelId) {
                $scope.relationship.parcel_id = parcelId;
            }


            //add all parcels to the map
            var promise = dataService.getCadastaMapData(cadastaProject.id);

            promise.then(function (response) {

                // If there is a project extent add it to the map
                projectLayer = L.geoJson(response.project.features, {style: extentStyle});
                projectLayer.addTo(map);

                response.parcels.features.forEach(function (parcel) {
                    var parcelToAdd = L.geoJson(parcel, {style: parcelStyle});
                    parcelToAdd.addTo(parcelGroup);
                });


                //zoom to project extent
                if(response.project.features[0].geometry !== null){
                    map.fitBounds(projectLayer.getBounds());
                } else if (response.parcels.features.length > 0) {
                    map.fitBounds(parcelGroup.getBounds());
                } else {
                    map.setView([lat, lng], zoom);
                }

            }, function (err) {
                console.error(err);
            });

            parcelGroup.on('click', function(e) {
                parcelGroup.setStyle(parcelStyle);
                e.layer.setStyle(selectStyle);
                $scope.relationshipParcelId = e.layer.feature.properties.id;
            });

        }

        /**
         * Functions related to the update party modal
         * @returns {*}
         */

            //modal for adding a parcel
        $scope.updatePartylModal = function (ev) {
            $mdDialog.show({
                templateUrl: '/project-dashboard/src/partials/edit_party.html',
                controller: updatePartyCtrl,
                parent: angular.element(document.body),
                clickOutsideToClose: false,
                locals: {cadastaProject: cadastaProject, party:$scope.party}
            })
        };



        function updatePartyCtrl($scope, $mdDialog, $stateParams, party, cadastaProject) {
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.cadastaProjectId = cadastaProject.id;
            $scope.party = party;

            $scope.updateParty = function (projectId) {

                $scope.updateParty = function(projectId, party){

                    var updateParty = partyService.updateProjectParty(projectId, $stateParams.id, party);

                    updateParty.then(function (response) {
                        if (response.cadasta_party_id){

                            $scope.partyCreated = 'party successfully updated';

                            $rootScope.$broadcast('updated-party');
                            getPartyDetails ();

                            var timeoutID = window.setTimeout(function() {
                                $scope.cancel();
                            }, 300);
                        }
                    }).catch(function(err){

                        $scope.partyCreated ='unable to update party';
                    });
                }

            }
        }

    }]);


