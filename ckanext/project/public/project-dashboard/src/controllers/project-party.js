app.controller("partyCtrl", ['$scope', '$state', '$stateParams','partyService','$rootScope','paramService', 'utilityService', 'uploadResourceService', '$mdDialog', 'ckanId', 'cadastaProject', 'FileUploader', 'ENV',
    function($scope, $state, $stateParams, partyService,$rootScope,paramService, utilityService, uploadResourceService, $mdDialog, ckanId, cadastaProject, FileUploader, ENV){


        $rootScope.$broadcast('tab-change', {tab: 'Parties'}); // notify breadcrumbs of tab on page load

        $rootScope.$broadcast('party-details', {id: $stateParams.id});

        $scope.clearPartyBreadCrumb = function () {
            $rootScope.$broadcast('clear-inner-party-tab');
        };

        $scope.toggleDropdownDetails = function (obj) {
            obj.showDropDownDetails = !obj.showDropDownDetails;
        };

        var mapStr = $stateParams.map;

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
            "color": "#88D40E",
            "stroke": "#88D40E",
            "opacity":.8,
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

                        // add relationship geometries to map
                        if(val.geometry !== null){
                            layer = L.geoJson(val, {style: relationshipStyle});
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

    }]);


