app.controller("parcelCtrl", ['tenureTypes','$scope', '$state', '$stateParams', 'parcelService', '$rootScope', 'paramService', 'utilityService', 'dataService', '$mdDialog', 'ckanId', 'cadastaProject', 'FileUploader', 'ENV', 'partyService', 'relationshipService','USER_ROLES', 'PROJECT_CRUD_ROLES', 'userRole', 'PROJECT_RESOURCE_ROLES',
    function (tenureTypes,$scope, $state, $stateParams, parcelService, $rootScope, paramService, utilityService, dataService, $mdDialog, ckanId, cadastaProject, FileUploader, ENV, partyService, relationshipService, USER_ROLES, PROJECT_CRUD_ROLES, userRole, PROJECT_RESOURCE_ROLES) {

        // Add user's role to the scope
        $scope.showCRUDLink = PROJECT_CRUD_ROLES.indexOf(userRole) > -1;
        $scope.showResourceLink = PROJECT_RESOURCE_ROLES.indexOf(userRole) > -1;

        var mapStr = $stateParams.map;

        $rootScope.$broadcast('tab-change', {tab: 'Parcels'}); // notify breadcrumbs of tab on page load

        // parse map query param
        var mapArr = mapStr.substring(1, mapStr.length - 1).split(',');


        var parcelStyle = {
            "color": "#e54573",
            "stroke": true,
            "weight": 3,
            "fillOpacity": .1,
            "opacity": .8,
            "marker-color": "#e54573",
            "clickable" : false
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
//         var relationshipGroup = L.featureGroup().addTo(map);

        getParcelDetails();

        function getParcelDetails() {

            var layer;

            var promise = parcelService.getProjectParcel(cadastaProject.id, $stateParams.id);

            promise.then(function (response) {

                // notify breadcrumbs of parcel selection
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

                //reformat relationship history dates
                response.properties.relationship_history.forEach(function (val) {
                    val.properties.time_created = utilityService.formatDate(val.properties.time_created);
                    val.properties.time_updated = utilityService.formatDate(val.properties.time_updated);
                });

                $scope.parcel_history = response.properties.parcel_history;

                $scope.relationships = response.properties.relationships;

                $scope.relationship_history = response.properties.relationship_history;

//                 relationshipGroup.clearLayers();
                parcelGroup.clearLayers();

                //update values for UI
                $scope.relationships.forEach(function (v, i) {

                    var name = null;
                    if (v.properties.full_name) {
                        name = v.properties.full_name;
                    } else {
                        name = v.properties.group_name;
                    }

                    var popup_content = '<h3>Relationship ' + v.properties.id + '</h3><p class="popup-text">Tenure Type:' + v.properties.tenure_type + ' </p><p class="popup-text">Party: ' + name + '</p><a href="#/relationships/' + v.properties.id + '"> See Full Details<i class="material-icons arrow-forward">arrow_forward</i></a>';


                    if(v.geometry !== null){
                        layer = L.geoJson(v, {
                            style: relationshipStyle,
                            pointToLayer: function (feature, latlng) {
                                return L.circleMarker(latlng, relationshipStyle);
                            }
                        });
                        layer.bindPopup(popup_content);
                        layer.addTo(parcelGroup);
//                         map.fitBounds(parcelGroup.getBounds());
                    }


                    v.showDropDownDetails = (i === 0);

                    v.properties.active = v.properties.active ? 'Active' : 'Inactive';
                    v.properties.relationship_type = 'own' ? 'Owner' : v.properties.relationship_type;

                });

                // If there are any parcels, load the map and zoom to parcel
                if (response.geometry) {
                    layer = L.geoJson(response, {
                        style: parcelStyle,
                        pointToLayer: function (feature, latlng) {
                            return L.circleMarker(latlng, parcelStyle);
                        }
                    }).addTo(parcelGroup);
                    map.fitBounds(parcelGroup.getBounds());

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

                        $scope.cancel();

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

        $scope.relationshipCreatedFeedback = '';

        function addRelationshipCtrl($scope, $mdDialog, $stateParams) {
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.cadastaProjectId = cadastaProject.id;
            $scope.relationship = {};

            var columnDefs = [
                {headerName: "Party ID", field: "id"},
                {headerName: "Name", field: "party_name"},
                {headerName: "Party Type", field: "type"},
                {headerName: "Active Relationships", field: "num_relationships"}
            ];

            $scope.selectPartyGridOptions = {
                columnDefs: columnDefs,
                rowData: [],
                enableSorting: true,
                rowHeight:50,
                headerHeight:37,
                rowSelection: 'single',
                onRowSelected: rowSelectedFunc
            };

            function rowSelectedFunc(event) {
                $scope.relationship.party = {};
                $scope.relationship.party.id = event.node.data.id;
            }

            var promise = partyService.getProjectParties(cadastaProject.id);

            promise.then(function (response) {
                $scope.parties = response;

                var partyData = [];

                //get row data
                response.forEach(function (party) {
                    if (party.properties.group_name){
                        party.properties.party_name = party.properties.group_name;
                    }
                    else {
                        party.properties.party_name = party.properties.full_name;
                    }
                    partyData.push(party.properties);
                });

                // add data to column rows
                $scope.selectPartyGridOptions.api.setRowData(partyData);
                $scope.selectPartyGridOptions.api.sizeColumnsToFit();


            }, function (err) {
                $scope.parties = "Server Error";
            });

            $scope.maxDate = new Date();

            $scope.format = 'dd/MM/yyyy';

            $scope.saveNewRelationship = function () {

                var layer = getLayer();

                if (layer) {
                    layer = layer.toGeoJSON().geometry;
                }

                if ($scope.dt) {
                    $scope.relationship.acquisition_date = new Date($scope.dt.setMinutes( $scope.dt.getTimezoneOffset() ));
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

                            $scope.cancel();

                        }
                    }).catch(function(response){
                        $scope.relationshipCreatedFeedback = 'Unable to create relationship: ' + response.data.error.message;
                    });

                }
            }

            $scope.tenure_types = tenureTypes;
        }

        function addMap() {

            var map = L.map('editParcelMap');

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
                    "stroke-opacity":.7,
                    "clickable":false
                };


                if(response.features[0].geometry) {

                    var layer = L.geoJson(response.features[0], {
                        style: extentStyle,
                        pointToLayer: function (feature, latlng) {
                            return L.circleMarker(latlng, extentStyle);
                        }
                    });
                    layer.addTo(parcelGroup);
                }
            });


            var parcelStyle = {
                "color": "#e54573",
                "stroke": true,
                "weight": 3,
                "fillOpacity": .1,
                "opacity": .8,
                "marker-color": "#e54573",
                "clickable" : false
            };

            //add parcel extent to the map
            var parcelLayer = L.geoJson($scope.parcelObject, {
                style: parcelStyle,
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, parcelStyle);
                }
            });

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
                url: ENV.apiCKANRoot + '/cadasta_upload_project_resources'
            });

            function resetProgress() {
                $scope.progress = 0;
            }

            $scope.uploader.onBeforeUploadItem = function (item) {
                // upload required path params for CKAN to proxy
                item.formData.push({
                    project_id: cadastaProject.id,
                    resource_type: "parcel",
                    resource_type_id: $stateParams.id
                });
            };

            $scope.uploader.onProgressItem = function (item, progress) {
                $scope.progress = progress;
            };

            // triggered when FileItem is has completed .upload()
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

                    getParcelResources();
                    $rootScope.$broadcast('new-resource'); // broadcast new resources to the app
                }
                else if(response.error){

                    if (response.error.type && response.error.type.pop && response.error.type.pop() === "duplicate") {
                        $scope.error = 'This resource already exists. Rename resource to complete upload.';
                    }
                    else if(response.error.message) {
                        $scope.error = response.error.message;
                    }
                    else {
                        $scope.error = response.error;
                    }
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
                resetProgress();
            };

        }

        // TODO move to config or service
        // TODO create endpoint that grabs project specific tenure types
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
