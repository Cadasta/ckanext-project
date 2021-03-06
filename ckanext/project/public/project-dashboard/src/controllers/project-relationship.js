app.controller("relationshipCtrl", ['tenureTypes', 'acquiredTypes', '$scope', '$state', '$stateParams','relationshipService','$rootScope','paramService', 'utilityService', '$mdDialog', 'ckanId', 'cadastaProject', 'FileUploader', 'ENV','parcelService', 'partyService', 'USER_ROLES', 'PROJECT_CRUD_ROLES', 'userRole', 'PROJECT_RESOURCE_ROLES',
    function(tenureTypes, acquiredTypes, $scope, $state, $stateParams, relationshipService,$rootScope,paramService, utilityService, $mdDialog, ckanId, cadastaProject, FileUploader, ENV, parcelService, partyService, USER_ROLES, PROJECT_CRUD_ROLES, userRole, PROJECT_RESOURCE_ROLES){

        // Add user's role to the scope
        $scope.showCRUDLink = PROJECT_CRUD_ROLES.indexOf(userRole) > -1;
        $scope.showResourceLink = PROJECT_RESOURCE_ROLES.indexOf(userRole) > -1;

        var mapStr = $stateParams.map;

        $scope.relationship = {};
        $scope.resources = [];
        $scope.parcel = {};

        $rootScope.$broadcast('tab-change', {tab: 'Relationships'}); // notify breadcrumbs of tab on page load

        $scope.clearRelationshipBreadCrumb = function () {
            $rootScope.$broadcast('clear-inner-tabs');
        };

        //parse map query param
        var mapArr = mapStr.substring(1,mapStr.length-1).split(',');

        var lat = mapArr[0];
        var lng = mapArr[1];
        var zoom = mapArr[2];


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
            "weight" : 2,
            "clickable":false
        };

        // setup map
        var map = L.map('relationshipDetailsMap', {scrollWheelZoom:false});

        // After each pan or zoom
        map.on('moveend', function(){

            if($state.current.name !== 'tabs.relationships.relationship') {
                return;
            }

            var center = map.getCenter();
            var zoom = map.getZoom();
            var param  = '('+[center.lat, center.lng, zoom].join(',')+ ')';
            $stateParams.map = param;
            paramService.setStateParam($state.current.name, 'map', param);
            $state.go($state.current.name, $stateParams, {notify:false});
        });

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
            collapsed:true,
            position:'bottomright'
        }).addTo(map);

        //add layer for adding parcels
        var relationshipGroup = L.featureGroup().addTo(map);
        relationshipGroup.bringToFront();

        getRelationship();
        getRelationshipResources();

        function getRelationshipParcel(parcel_id){
            var promise = parcelService.getProjectParcel(cadastaProject.id, parcel_id);

            promise
                .then(function(response){

                    if(response.geometry !== null){
                        var layer = L.geoJson(response, {
                            style: parcelStyle,
                            pointToLayer: function (feature, latlng) {
                                return L.circle(latlng, 10, {"fillOpacity":.7, "opacity":.7, "weight":0} );
                            }
                        }).addTo(relationshipGroup);

                        // zoom to parcel bounds if there is no relationship geometry
                        if(Object.keys(relationshipGroup._layers).length == 1){
                            map.fitBounds(relationshipGroup.getBounds());
                        }
                    }
                })
        }

        function getRelationship () {
            var promise = relationshipService.getProjectRelationship(cadastaProject.id, $stateParams.id);

            promise.then(function(response){

                // notify breadcrumbs of relationship selection
                $rootScope.$broadcast('relationship-details', {id: $stateParams.id});

                    //clear layers
                    relationshipGroup.clearLayers();

                    // If there are any relationships, load the map and zoom to relationship
                    if (response.geometry) {
                        var layer = L.geoJson(response, {
                            style: relationshipStyle,
                            pointToLayer: function (feature, latlng) {
                                return L.circle(latlng, 10, {"fillOpacity":.7, "opacity":.7, "weight":0} );
                            }
                        }).addTo(relationshipGroup);

                        map.fitBounds(relationshipGroup.getBounds());

                    } else {
                        map.setView([lat, lng], zoom);
                    }

                    response.properties.active = response.properties.active ? 'Active' : 'Inactive';

                    $scope.relationship  = response;

                    if (response.properties.acquired_date) {
                        response.properties.acquired_dateDMY = utilityService.formatDate(response.properties.acquired_date);
                    }

                    //reformat relationship history dates
                    response.properties.relationship_history.forEach(function (val) {
                        val.properties.time_created = utilityService.formatDate(val.properties.time_created);
                        val.properties.time_updated = utilityService.formatDate(val.properties.time_updated);
                    });

                    $scope.relationship_history = response.properties.relationship_history;

                    getRelationshipParcel(response.properties.parcel_id);

                })
                .catch(function(error){
                    $scope.error = error;
                })
        }

        function getRelationshipResources() {
            var promise = relationshipService.getProjectRelationshipResources(cadastaProject.id,$stateParams.id);

            promise
                .then(function(response){
                    $scope.resources = response;

                    //reformat date created of resources
                    $scope.resources.forEach(function (resource) {
                        resource.properties.time_created = utilityService.formatDate(resource.properties.time_created);
                    });
                })
                .catch(function(err){
                    $scope.error = err;
                })
        }


        $scope.relationshipUpdatedFeedback = '';

        //modal for adding a relationship
        $scope.updateRelationshipModal = function (ev) {
            $mdDialog.show({
                templateUrl: '/project-dashboard/src/partials/edit_relationship.html',
                controller: updateRelationshipCtrl,
                parent: angular.element(document.body),
                clickOutsideToClose: false,
                onComplete: addMap,
                locals: {cadastaProject: cadastaProject, relationship:$scope.relationship}
            })
        };



        /**
         * Functions related to the update relationship modal
         * @returns {*}
         */
        function updateRelationshipCtrl($scope, $mdDialog, $stateParams, cadastaProject, relationship) {
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.showDatepicker = false;

            if(relationship.properties.acquired_date !== null){
                $scope.dt = utilityService.parseDate(relationship.properties.acquired_date);
            }

            $scope.cadastaProjectId = cadastaProject.id;
            $scope.relationship = relationship;

            var promise = partyService.getProjectParties(cadastaProject.id);

            promise.then(function (response) {
                $scope.parties = response;

            }, function (err) {
                $scope.parties = "Server Error";
            });

            // set date picker's max date to today
            $scope.myDate = new Date();

            $scope.open = function($event) {
                $scope.status.opened = true;
            };

            $scope.format = 'd/M/yyyy';

            $scope.status = {
                opened: false
            };

            $scope.maxDate = new Date();
            $scope.format = 'dd/MM/yyyy';

            $scope.updateRelationship = function (projectId) {

                var layer = getLayer();

                if ($scope.dt && $scope.showDatepicker ) {
                    $scope.relationship.acquired_date = new Date($scope.dt.setMinutes( $scope.dt.getTimezoneOffset() ));
                }


                if (layer && ($scope.relationshipGeomMap == 'relationship')) {
                    layer = layer.toGeoJSON();
                }
                else {
                    layer = undefined;
                }

                //
                //if (layer === undefined) {
                //    layer = null;
                //} else {
                //    layer = layer.toGeoJSON();
                //}
                var updateExistingRelationship = relationshipService.updateProjectRelationship(cadastaProject.id, $stateParams.id, layer, $scope.relationship);

                updateExistingRelationship.then(function (response) {
                    if (response.cadasta_relationship_history_id){

                        $rootScope.$broadcast('updated-relationship');

                        getRelationship();

                        $scope.cancel();
                    }
                }).catch(function(response){
                    $scope.relationshipUpdatedFeedback = 'Unable to update relationship: ' + response.data.error.message;
                });

            }

            $scope.tenure_types = tenureTypes;
            $scope.acquired_types = acquiredTypes;
        }

        /**
         * Function is called after modal is instantiated to load map data
         * @returns {*}
         */
        function addMap() {

            var mapStr = $stateParams.map;

            //parse map query param
            var mapArr = mapStr.substring(1,mapStr.length-1).split(',');

            var lat = mapArr[0];
            var lng = mapArr[1];
            var zoom = mapArr[2];

            var map = L.map('editRelationshipMap', {scrollWheelZoom: false});

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
                collapsed:true,
                position:'bottomright'
            }).addTo(map);

            map.setView([lat, lng], zoom);

            var featureGroup = L.featureGroup().addTo(map);

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
                "weight" : 2,
                "clickable":false
            };


            //add parcel data to the map
            var promiseParcel = parcelService.getProjectParcel(cadastaProject.id, $scope.relationship.properties.parcel_id);

            promiseParcel.then(function(response){

                    if(response.geometry !== null){
                        var layer = L.geoJson(response, {
                            style: parcelStyle,
                            pointToLayer: function (feature, latlng) {
                                return L.circle(latlng, 10, {"fillOpacity":.7, "opacity":.7, "weight":0} );
                            }
                        }).addTo(map);
                        map.fitBounds(layer.getBounds());
                    }
                });


            //add relationship extent to the map
            var promiseRelationship = relationshipService.getProjectRelationship(cadastaProject.id, $stateParams.id);

            promiseRelationship.then(function(response) {

                if (response.geometry) {
                    var layer = L.geoJson(response, {
                        style: relationshipStyle,
                        pointToLayer: function (feature, latlng) {
                            return L.circle(latlng, 10, {"fillOpacity":.7, "opacity":.7, "weight":0} );
                        }
                    }).addTo(map);
                    map.fitBounds(layer.getBounds());
                }
                else {
                    map.setView([lat, lng], zoom);
                }
            });

            //prepopulate fields to update with existing data
            $scope.relationship.tenure_type = $scope.relationship.properties.tenure_type;
            $scope.relationship.how_acquired = $scope.relationship.properties.how_acquired;
            $scope.relationship.acquired_date = $scope.relationship.properties.acquired_date;

            //draw relationship map is hidden unless
            $('#DrawRelationshipMap').addClass('hidden');

            // using JQuery rather than angular because map needs to be fully rendered before being hidden
            $('.useRelationshipGeom').on('click', function() {
                $('#DrawRelationshipMap').removeClass('hidden');
            });

            $('.useParcelGeom').on('click', function() {
                $('#DrawRelationshipMap').addClass('hidden');
            });
        }

        function getLayer() {
            return $scope.layer;
        }


        /**
         * Functions related to the project-level resource modal
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
            $scope.answer = function (answer) {
                $mdDialog.hide(answer);
            };

            $scope.resourceDescription = '';

            function resetProgress() {
                $scope.progress = 0;
            }

            $scope.uploader = new FileUploader({
                alias: 'filedata',
                url: ENV.apiCKANRoot + '/cadasta_upload_project_resources'
            });

            $scope.uploader.onProgressItem = function (item, progress) {
                $scope.progress = progress;
            };

            $scope.uploader.onBeforeUploadItem = function (item) {
                // upload required path params
                item.formData.push({
                    project_id: cadastaProject.id,
                    resource_type: "relationship",
                    resource_type_id: $stateParams.id,
                    description: $scope.resourceDescription
            });
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

                    getRelationshipResources();
                }
                else if(response.error){

                    if (response.error.type && response.error.type.pop && response.error.type.pop() === "duplicate") {
                        utilityService.showToastBottomRight('This resource already exists. Rename resource to complete upload.');
                    }
                    else if(response.error.message) {
                        utilityService.showToastBottomRight(response.error.message);
                    }
                    else {
                        utilityService.showToastBottomRight('Error uploading resource.');
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

