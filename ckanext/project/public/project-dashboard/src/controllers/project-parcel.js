app.controller("parcelCtrl", ['$scope', '$state', '$stateParams', 'parcelService', '$rootScope', 'paramService', 'utilityService', 'uploadResourceService', 'dataService', '$mdDialog', 'ckanId', 'cadastaProject', 'FileUploader', 'ENV',
    function ($scope, $state, $stateParams, parcelService, $rootScope, paramService, utilityService, uploadResourceService, dataService, $mdDialog, ckanId, cadastaProject, FileUploader, ENV) {


        var mapStr = $stateParams.map;

        $rootScope.$broadcast('tab-change', {tab: 'Parcels'}); // notify breadcrumbs of tab on page load

        // parse map query param
        var mapArr = mapStr.substring(1, mapStr.length - 1).split(',');

        getParcelResources(false);

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

        $scope.parcel = null;

        $scope.toggleDropdownDetails = function (obj) {
            obj.showDropDownDetails = !obj.showDropDownDetails;
        };

        $scope.clearParcelBreadCrumb = function () {
            $rootScope.$broadcast('clear-inner-tabs');
        };

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

            //update values for UI
            $scope.relationships.forEach(function (v, i) {
                if (i === 0) {
                    v.showDropDownDetails = true;
                } else {
                    v.showDropDownDetails = false;
                }


                v.properties.active = v.properties.active ? 'Active' : 'Inactive';
                v.properties.relationship_type = 'own' ? 'Owner' : v.properties.relationship_type;
            });

            var parcelStyle = {
                "color": "#e54573",
                "stroke": "#e54573",
                "stroke-width": 1,
                "fill-opacity": .8,
                "stroke-opacity": .8
            };


            // If there are any parcels, load the map and zoom to parcel
            if (response.geometry) {
                var layer = L.geoJson(response, {style: parcelStyle}).addTo(map);
                map.fitBounds(layer.getBounds());
            } else {
                map.setView([lat, lng], zoom);
            }

            return parcelService.getProjectParcelRelationshipHistory(cadastaProject.id, $stateParams.id);

        }, function (err) {
            $scope.overviewData = "Server Error";
        });

        function getParcelResources(cache) {
            var resource_promise = parcelService.getProjectParcelResources(cadastaProject.id, $stateParams.id, cache);

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



        //modal for adding a parcel
        $scope.updateParcelModal = function (ev) {
            $mdDialog.show({
                templateUrl: '/project-dashboard/src/partials/edit_parcel.html',
                controller: updateParcelCtrl,
                parent: angular.element(document.body),
                clickOutsideToClose: false,
                onComplete: addMap,
                locals: {cadastaProject: cadastaProject}
            })
        };

        function addMap() {

            var map = L.map('editParcelMap');

            L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
                attribution: '',
                id: 'spatialdev.map-rpljvvub',
                zoomControl: true,
                accessToken: 'pk.eyJ1Ijoic3BhdGlhbGRldiIsImEiOiJKRGYyYUlRIn0.PuYcbpuC38WO6D1r7xdMdA#3/0.00/0.00'
            }).addTo(map);


            var featureGroup = L.featureGroup().addTo(map);


            var options = {
                draw: {
                    polyline: {
                        shapeOptions: {
                            "color": "#FF8000",
                            "stroke": "#FF8000",
                            "stroke-width": 1,
                            "fill-opacity":.7,
                            "stroke-opacity":.8
                        }
                    },
                    polygon: {
                        shapeOptions: {
                            "color": "#FF8000",
                            "stroke": "#FF8000",
                            "stroke-width": 1,
                            "fill-opacity":.7,
                            "stroke-opacity":.8
                        }
                    },
                    circle: {
                        shapeOptions: {
                            "color": "#FF8000",
                            "stroke": "#FF8000",
                            "stroke-width": 1,
                            "fill-opacity":.7,
                            "stroke-opacity":.8
                        }
                    },
                    rectangle: {
                        shapeOptions: {
                            "color": "#FF8000",
                            "stroke": "#FF8000",
                            "stroke-width": 1,
                            "fill-opacity":.7,
                            "stroke-opacity":.8
                        }
                    }
                    //},
                    //marker: {
                    //    icon: new MyCustomMarker()
                    //}
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

        }

        function getLayer() {
            return $scope.layer;
        }


        function updateParcelCtrl($scope, $mdDialog) {
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.cadastaProjectId = cadastaProject.id;
            $scope.showSaveParcel = false;

            $scope.updateParcel = function (projectId) {
                // todo hit endpoint to update parcel geometry
                var layer = getLayer();
                alert("saved new project" + projectId + layer.toGeoJSON());
                parcelService.createProjectParcel(projectId, layer.toGeoJSON());
            }
        }


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

                    getParcelResources(false);
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

        $scope.acquire_types = [

            {
                type: 'inheritance'
            },
            {
                type: 'lease'
            },
            {
                type: 'freehold'
            },
            {
                type: 'other'
            }
        ];

        $scope.myDate = new Date();
    }]);


