app.controller("partyCtrl", ['tenureTypes','$scope', '$state', '$stateParams', 'partyService', '$rootScope', 'paramService', 'utilityService', '$mdDialog', 'ckanId', 'cadastaProject', 'FileUploader', 'ENV', 'dataService', 'relationshipService', 'parcelService', 'USER_ROLES', 'PROJECT_CRUD_ROLES', 'userRole', 'PROJECT_RESOURCE_ROLES',
    function (tenureTypes,$scope, $state, $stateParams, partyService, $rootScope, paramService, utilityService, $mdDialog, ckanId, cadastaProject, FileUploader, ENV, dataService, relationshipService, parcelService, USER_ROLES, PROJECT_CRUD_ROLES, userRole, PROJECT_RESOURCE_ROLES) {

        // Add user's role to the scope
        $scope.showCRUDLink = PROJECT_CRUD_ROLES.indexOf(userRole) > -1;
        $scope.showResourceLink = PROJECT_RESOURCE_ROLES.indexOf(userRole) > -1;

        $rootScope.$broadcast('tab-change', {tab: 'Parties'}); // notify breadcrumbs of tab on page load

        $scope.clearPartyBreadCrumb = function () {
            $rootScope.$broadcast('clear-inner-tabs');
        };


        $scope.$on('new-relationship',function(){
            getPartyDetails();
        })

        $scope.toggleDropdownDetails = function (obj) {
            obj.showDropDownDetails = !obj.showDropDownDetails;
        };

        $scope.relationshipParcelId = null;

        var mapStr = $stateParams.map;

        // parse map query param
        var mapArr = mapStr.substring(1, mapStr.length - 1).split(',');

        var parcelStyle = {
            "clickable" : false,
            "color": "#e54573",
            "stroke": "#e54573",
            "stroke-width": 1,
            "fill-opacity": .6,
            "opacity": .8,
            "weight":2
        };

        var relationshipStyle = {
            "color": "#FF8000",
            "stroke": "#FF8000",
            "fill-opacity":.8,
            "opacity":.6,
            "weight" : 2
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
        var satellite = L.tileLayer('https://api.tiles.mapbox.com/v4/mapbox.streets-satellite/{z}/{x}/{y}.png?access_token={accessToken}', {
            attribution: '',
            maxZoom: 18,
            id: 'spatialdev.map-rpljvvub',
            zoomControl: true,
            accessToken: 'pk.eyJ1IjoiZGlnaXRhbGdsb2JlIiwiYSI6ImNpaDN3NzE5dzB5eGR4MW0wdnhpM29ndG8ifQ.3MqbbPFrSfeeQwbmGIES1A'
        });

        var osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '',
            maxZoom: 18,
            zoomControl: true
        }).addTo(map);

        var overlays = {"Mapbox Satellite": satellite, "Standard OpenStreetMap": osm};

        L.control.layers(overlays,null, {
            collapsed:true,
            position:'bottomright'
        }).addTo(map);

        //add layer for adding parcels
        var parcelGroup = L.featureGroup().addTo(map);
        var relationshipGroup = L.featureGroup().addTo(map);

        getPartyDetails();
        getPartyResources();

        function getPartyDetails() {

            var layer;

            var promise = partyService.getProjectParty(cadastaProject.id, $stateParams.id);

            promise.then(function (response) {

                // notify breadcrumbs  of party selection
                $rootScope.$broadcast('party-details', {id: $stateParams.id});

                $scope.party = response.properties;

                parcelGroup.clearLayers();
                relationshipGroup.clearLayers();

                //// format dates
                $scope.party.time_created = utilityService.formatDate($scope.party.time_created);
                $scope.party.time_updated = utilityService.formatDate($scope.party.time_created);
                
                if($scope.party.dob !== null){
                   $scope.party.dobDMY = utilityService.formatDate($scope.party.dob);                        
                }

                if (response.properties.relationship_history.length > 0) {

                    response.properties.relationship_history.forEach(function (val) {
                        val.properties.time_created = utilityService.formatDate(val.properties.time_created);
                        val.properties.time_updated = utilityService.formatDate(val.properties.time_updated);
                    })
                }

                if (response.properties.relationships.length > 0) {
                    response.properties.relationships.forEach(function (val) {
                        ////reformat relationship dates
                        val.properties.time_created = utilityService.formatDate(val.properties.time_created);
                        val.properties.time_updated = utilityService.formatDate(val.properties.time_updated);

                        //create popup for relationship
                        var name = null;
                        if (val.properties.full_name) {
                            name = val.properties.full_name;
                        } else {
                            name = val.properties.group_name;
                        }
                        var popup_content = '<h3>Relationship ' + val.properties.id + '</h3><p class="popup-text">Tenure Type:' + val.properties.tenure_type + ' </p><p class="popup-text">Party: ' + name + '</p><a href="#/relationships/' + val.properties.id + '"> See Full Details<i class="material-icons arrow-forward">arrow_forward</i></a>';

                        // add relationship geometries to map
                        if (val.geometry !== null) {
                            layer = L.geoJson(val, {
                                style: relationshipStyle,
                                pointToLayer: function (feature, latlng) {
                                    return L.circle(latlng, 10, {"fillOpacity":.7, "opacity":.7, "weight":0} );
                                }
                            });
                            layer.bindPopup(popup_content);
                            layer.addTo(parcelGroup);
                            map.fitBounds(parcelGroup.getBounds());
                        }
                    })
                }


                var parcels = response.properties.parcels;

                // add parcel geometries to map
                if (parcels.length > 0) {
                    parcels.forEach(function (p) {
                        if (p.geometry !== null) {
                            layer = L.geoJson(p, {
                                style: parcelStyle,
                                pointToLayer: function (feature, latlng) {
                                    return L.circle(latlng, 10, {"fillOpacity":.7, "opacity":.7, "weight":0} );
                                }
                            });
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

        $scope.relationshipCreatedFeedback = '';

        function addRelationshipCtrl($scope, $mdDialog, $stateParams, utilityService) {
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.cadastaProjectId = cadastaProject.id;
            $scope.relationship = {};

            $scope.relationship.party = {};
            $scope.relationship.party.id = $stateParams.id;

            $scope.maxDate = new Date();
            $scope.format = 'dd/MM/yyyy';

            $scope.saveNewRelationship = function () {

                var layer = getLayer();

                if (layer) {
                    layer = layer.toGeoJSON().geometry;
                }

                var relationshipParcelId = getRelationshipParcelId();

                if (relationshipParcelId == undefined) {
                    utilityService.showToast('Parcel is required');
                }
                else if ($scope.relationship.tenure_type == undefined) {
                    utilityService.showToast('Tenure type is required');
                }
                else if ((relationshipParcelId != undefined) && ($scope.relationship.tenure_type != undefined)) {

                    if($scope.dt){
                        $scope.relationship.acquisition_date =  new Date($scope.dt.setMinutes( $scope.dt.getTimezoneOffset() ));
                    }
                    $scope.relationship.description = $scope.description;

                    var createRelationship = relationshipService.createProjectRelationship(cadastaProject.id, relationshipParcelId, layer, $scope.relationship);

                    createRelationship.then(function (response) {
                        if (response.cadasta_relationship_id) {

                            $rootScope.$broadcast('new-relationship');
                            getPartyDetails();

                            $scope.cancel();
                        }
                    }).catch(function (response) {
                        utilityService.showToast('Unable to create relationship');
                    });

                }
            }

            $scope.tenure_types = tenureTypes;
        }

        /**
         * function called after modal has been instantiated to set up map
         */
        function addMap() {

            var map = L.map('editParcelMap', {scrollWheelZoom: false});

            var satellite = L.tileLayer('https://api.tiles.mapbox.com/v4/mapbox.streets-satellite/{z}/{x}/{y}.png?access_token={accessToken}', {
                attribution: '',
                maxZoom: 18,
                id: 'spatialdev.map-rpljvvub',
                zoomControl: true,
                accessToken: 'pk.eyJ1IjoiZGlnaXRhbGdsb2JlIiwiYSI6ImNpaDN3NzE5dzB5eGR4MW0wdnhpM29ndG8ifQ.3MqbbPFrSfeeQwbmGIES1A'
            });

            var osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                attribution: '',
                maxZoom: 18,
                zoomControl: true
            }).addTo(map);

            var overlays = {"Mapbox Satellite": satellite, "Standard OpenStreetMap": osm};

            L.control.layers(overlays,null, {
                collapsed:true
            }).addTo(map);


            var featureGroup = L.featureGroup().addTo(map);
            var parcelGroup = L.featureGroup().addTo(map);


            var editIcon = L.icon({
                iconUrl: '/images/green_marker.png',
                iconSize: [30, 30]
            });

            var options = {
                draw: {
                    polyline: {
                        shapeOptions: {
                            "color": "#88D40E",
                            "stroke": true,
                            "stroke-width": 1,
                            "fill-opacity": .7,
                            "stroke-opacity": .8
                        }
                    },
                    polygon: {
                        shapeOptions: {
                            "color": "#88D40E",
                            "stroke": true,
                            "stroke-width": 1,
                            "fill-opacity": .7,
                            "stroke-opacity": .8
                        }
                    },
                    circle: false,
                    rectangle: {
                        shapeOptions: {
                            "color": "#88D40E",
                            "stroke": true,
                            "stroke-width": 1,
                            "fill-opacity": .7,
                            "stroke-opacity": .8
                        }
                    },
                    marker: {
                        icon: editIcon
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
                "fill-opacity": .1,
                "stroke-opacity": .7,
                "clickable": false
            };

            var parcelStyle = {
                "color": "#e54573",
                "stroke": "#e54573",
                "stroke-width": 1,
                "fill-opacity": .6,
                "opacity": .8,
                "weight":2
            };



            var selectStyle = {
                "color": "#6324C3",
                "stroke": true,
                "stroke-width": 1,
                "fill-opacity": .1,
                "stroke-opacity": .8,
                "marker-color": "#e54573"
            };

            var selectParcel = function (parcelId) {
                $scope.relationship.parcel_id = parcelId;
            }


            //add all parcels to the map
            var promise = dataService.getCadastaMapData(cadastaProject.id);

            promise.then(function (response) {

                // If there is a project extent add it to the map
                projectLayer = L.geoJson(response.project.features, {
                    style: extentStyle,
                    pointToLayer: function (feature, latlng) {
                        return L.circle(latlng, 10, {"fillOpacity":.7, "opacity":.7, "weight":0} );
                    }
                });
                projectLayer.addTo(map);

                response.parcels.features.forEach(function (parcel) {
                    var parcelToAdd = L.geoJson(parcel, {
                        style: parcelStyle,
                        pointToLayer: function (feature, latlng) {
                            return L.circle(latlng, 10, {"fillOpacity":.7, "opacity":.7, "weight":0} );
                        }
                    });
                    parcelToAdd.addTo(parcelGroup);
                });


                //zoom to project extent
                if (response.project.features[0].geometry !== null) {
                    map.fitBounds(projectLayer.getBounds());
                } else if (response.parcels.features.length > 0) {
                    map.fitBounds(parcelGroup.getBounds());
                } else {
                    map.setView([lat, lng], zoom);
                }

            }, function (err) {
                console.error(err);
            });

            parcelGroup.on('click', function (e) {
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
                locals: {cadastaProject: cadastaProject, party: $scope.party}
            })
        };

        $scope.partyUpdatedFeedback = '';

        function updatePartyCtrl($scope, $mdDialog, $stateParams, party, cadastaProject, utilityService) {
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.maxDate = new Date();
            $scope.format = 'dd/MM/yyyy';

            $scope.cadastaProjectId = cadastaProject.id;
            $scope.party = party;

            if(party.dob !== null){
                $scope.dt = utilityService.parseDate(party.dob);
            }

            $scope.updateParty = function (projectId, party) {

                if($scope.dt){
                    party.dob = new Date($scope.dt.setMinutes( $scope.dt.getTimezoneOffset() ));
                }

                var updateParty = partyService.updateProjectParty(projectId, $stateParams.id, party);

                updateParty.then(function (response) {
                    if (response.cadasta_party_id) {

                        $rootScope.$broadcast('updated-party');
                        getPartyDetails();

                        $scope.cancel();
                    }
                }).catch(function (response) {
                    utilityService.showToast('Unable to update party');
                });
            }
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

        function resourceDialogController($scope, $mdDialog, FileUploader, ENV, utilityService) {
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            function resetProgress() {
                $scope.progress = 0;
            }

            $scope.resourceDescription = '';

            $scope.uploader = new FileUploader({
                alias: 'filedata',
                url: ENV.apiCKANRoot + '/cadasta_upload_project_resources'
            });

            $scope.uploader.onBeforeUploadItem = function (item) {
                // upload required path params for CKAN to proxy
                item.formData.push({
                    project_id: cadastaProject.id,
                    resource_type: "party",
                    resource_type_id: $stateParams.id,
                    description: $scope.resourceDescription
                });
            };

            $scope.uploader.onProgressItem = function (item, progress) {
                $scope.progress = progress;
            };

            // triggered file upload complete (independently of the sucess of the operation)
            $scope.uploader.onCompleteItem = function (fileItem, response, status, headers) {
                //
                // ckan api wrappers return a 'result' key for successful calls
                // and an 'error' key for unsuccessful calls
                //
                if (response.result && response.result.message == "Success"){
                    $scope.response = 'File Successfully uploaded.';
                    $scope.error = ''; // clear error
                    $scope.uploader.clearQueue();
                    resetProgress();

                    getPartyResources();
                    $rootScope.$broadcast('new-resource'); // broadcast new resources to the app
                }
                else if(response.error){

                    if (response.error.type && response.error.type.pop && response.error.type.pop() === "duplicate") {
                        utilityService.showToastBottomRight('This resource already exists. Rename resource to complete upload.');
                    }
                    else if(response.error.message) {
                        utilityService.showToastBottomRight(response.error.message);
                    }
                    else {
                        utilityService.showToastBottomRight('Error uploading resource');
                    }

                    $scope.uploader.clearQueue();
                    resetProgress();
                }
            };

            $scope.uploader.onAfterAddingFile = function () {
                //remove previous item from queue
                if ($scope.uploader.queue.length > 1) {
                    $scope.uploader.removeFromQueue(0);
                }
            };

        }





    }]);


