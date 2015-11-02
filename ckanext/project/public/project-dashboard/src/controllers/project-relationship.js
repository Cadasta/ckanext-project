app.controller("relationshipCtrl", ['$scope', '$state', '$stateParams','relationshipService','$rootScope','paramService', 'utilityService', 'uploadResourceService', '$mdDialog', 'ckanId', 'cadastaProject', 'FileUploader', 'ENV','parcelService', 'partyService',
    function($scope, $state, $stateParams, relationshipService,$rootScope,paramService, utilityService, uploadResourceService, $mdDialog, ckanId, cadastaProject, FileUploader, ENV, parcelService, partyService){


        var mapStr = $stateParams.map;

        $scope.relationship = {};
        $scope.resources = [];
        $scope.parcel = {};

        $rootScope.$broadcast('tab-change', {tab: 'Relationships'}); // notify breadcrumbs of tab on page load

        $scope.clearRelationshipBreadCrumb = function () {
            $rootScope.$broadcast('clear-inner-relationship-tab');
        };

        //parse map query param
        var mapArr = mapStr.substring(1,mapStr.length-1).split(',');

        var lat = mapArr[0];
        var lng = mapArr[1];
        var zoom = mapArr[2];

        var parcelStyle = {
            "color": "#e54573",
            "stroke": "#e54573",
            "weight": 1,
            "fillOpacity": .5,
            "opacity": .8,
            "marker-color": "#e54573"
        };

        var relationshipStyle = {
            "color": "#88D40E",
            "stroke": "#88D40E",
            "opacity":.8,
            "fillOpacity":.5,
            "weight" : 1
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

        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
            attribution: '',
            maxZoom: 18,
            id: 'spatialdev.map-rpljvvub',
            accessToken: 'pk.eyJ1Ijoic3BhdGlhbGRldiIsImEiOiJKRGYyYUlRIn0.PuYcbpuC38WO6D1r7xdMdA#3/0.00/0.00'
        }).addTo(map);

        //add layer for adding parcels
        var relationshipGroup = L.featureGroup().addTo(map);
        var relationshipParcelLayer = null;

        getRelationship();
        getRelationshipResources();

        function getRelationshipParcel(parcel_id){
            var promise = parcelService.getProjectParcel(cadastaProject.id, parcel_id);

            promise
                .then(function(response){

                    if(response.geometry !== null){
                        var layer = L.geoJson(response, {style: parcelStyle}).addTo(relationshipGroup);
                        map.fitBounds(layer.getBounds());

                        relationshipParcelLayer = layer;
                    }

                })
        }

        function getRelationship () {
            var promise = relationshipService.getProjectRelationship(cadastaProject.id, $stateParams.id);

            promise
                .then(function(response){

                    //clear layers
                    relationshipGroup.clearLayers();

                    // If there are any relationships, load the map and zoom to relationship
                    if (response.geometry) {
                        var layer = L.geoJson(response, {style: relationshipStyle}).addTo(relationshipGroup);
                        map.fitBounds(layer.getBounds());
                    } else {
                        map.setView([lat, lng], zoom);
                    }

                    response.properties.active = response.properties.active ? 'Active' : 'Inactive';

                    $scope.relationship  = response;
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
                })
                .catch(function(err){
                    $scope.error = err;
                })
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
                url: ENV.apiCadastaRoot + '/projects/' + cadastaProject.id + '/relationship/' + $stateParams.id + '/resources'
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

                    getRelationshipResources();
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


        function addMap(map) {

            var map = L.map('editRelationshipMap');

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


            var parcelStyle = {
                "color": "#e54573",
                "stroke": "#e54573",
                "stroke-width": 1,
                "fill-opacity":.8,
                "stroke-opacity":.8,
            };

            var relationshipStyle = {
                "color": "#FF8000",
                "stroke": "#FF8000",
                "stroke-width": 1,
                "fill-opacity":.8,
                "stroke-opacity":.8,
            };

            //add parcel extent to the map
            //if (relationshipParcelLayer) {
            //    var parcelLayer = L.geoJson(relationshipParcelLayer, {style: parcelStyle}).addTo(map);
            //    map.fitBounds(parcelLayer.getBounds());
            //}

            //add relationship extent to the map

            //prepopulate fields to update with existing data
            $scope.relationship.party.id = $scope.relationship.properties.gov_pin;


        }

        function getLayer() {
            return $scope.layer;
        }

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


        function updateRelationshipCtrl($scope, $mdDialog, $stateParams, cadastaProject, relationship) {
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.cadastaProjectId = cadastaProject.id;
            $scope.relationship = relationship;


            var promise = partyService.getProjectParties(cadastaProject.id);

            promise.then(function (response) {
                $scope.parties = response;

            }, function (err) {
                $scope.parties = "Server Error";
            });



            $scope.updateRelationship = function (projectId) {
            //
            //    var layer = getLayer();
            //
            //    if (layer === undefined) {
            //        layer = null;
            //    } else {
            //        layer = layer.toGeoJSON();
            //    }
            //    var updateExistingParcel = parcelService.updateProjectParcel(cadastaProject.id, $stateParams.id, layer, $scope.parcel);
            //
            //    updateExistingParcel.then(function (response) {
            //        if (response.cadata_parcel_history_id){
            //
            //            $scope.parcelCreated = 'parcel successfully updated';
            //
            //            $rootScope.$broadcast('updated-parcel');
            //
            //            getParcelDetails();
            //
            //            var timeoutID = window.setTimeout(function() {
            //                $scope.cancel();
            //            }, 300);
            //        }
            //    }).catch(function(err){
            //
            //        $scope.parcelCreated ='unable to update parcel';
            //    });
            //
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




    }]);

