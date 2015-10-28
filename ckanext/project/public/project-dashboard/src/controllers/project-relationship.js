app.controller("relationshipCtrl", ['$scope', '$state', '$stateParams','relationshipService','$rootScope','paramService', 'utilityService', 'uploadResourceService', '$mdDialog', 'ckanId', 'cadastaProject', 'FileUploader', 'ENV','parcelService',
    function($scope, $state, $stateParams, relationshipService,$rootScope,paramService, utilityService, uploadResourceService, $mdDialog, ckanId, cadastaProject, FileUploader, ENV,parcelService){


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
            "stroke-width": 1,
            "fill-opacity": .8,
            "stroke-opacity": .8
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

        getRelationship();
        getRelationshipResources();

        function getRelationshipParcel(parcel_id){
            var promise = parcelService.getProjectParcel(cadastaProject.id, parcel_id);

            promise
                .then(function(response){

                    if(response.geometry !== null){
                        var layer = L.geoJson(response, {style: parcelStyle}).addTo(relationshipGroup);
                        map.fitBounds(layer.getBounds());
                    }

                })
        }

        function getRelationship () {
            var promise = relationshipService.getProjectRelationship(cadastaProject.id, $stateParams.id);

            promise
                .then(function(response){

                    //clear layers
                    relationshipGroup.clearLayers();

                    // If there are any parcels, load the map and zoom to parcel
                    if (response.geometry) {
                        var layer = L.geoJson(response, {style: parcelStyle}).addTo(relationshipGroup);
                        map.fitBounds(layer.getBounds());
                    } else {
                        map.setView([lat, lng], zoom);
                    }

                    response.properties.active = response.properties.active ? 'Active' : 'Inactive';

                    $scope.relationship  = response;

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


        //
        //var promise = parcelService.getProjectParcel(cadastaProject.id, $stateParams.id);
        //
        //promise.then(function(response){
        //
        //    $rootScope.$broadcast('parcel-details', {id:$stateParams.id});
        //
        //    $scope.parcel = response.properties;
        //
        //    // format dates
        //    $scope.parcel.time_created = utilityService.formatDate($scope.parcel.time_created);
        //    $scope.parcel.time_updated = utilityService.formatDate($scope.parcel.time_created);
        //
        //    //reformat parcel history dates
        //    response.properties.parcel_history.forEach(function(val){
        //        val.properties.time_created = utilityService.formatDate(val.properties.time_created);
        //        val.properties.time_updated = utilityService.formatDate(val.properties.time_updated);
        //    });
        //
        //    //reformat relationship dates
        //    response.properties.relationships.forEach(function(val){
        //        val.properties.time_created = utilityService.formatDate(val.properties.time_created);
        //        val.properties.time_updated = utilityService.formatDate(val.properties.time_updated);
        //    });
        //
        //    $scope.parcel_history = response.properties.parcel_history;
        //
        //    $scope.relationships = response.properties.relationships;
        //
        //    //update values for UI
        //    $scope.relationships.forEach(function(v,i){
        //        if (i === 0){
        //            v.showDropDownDetails = true;
        //        } else {
        //            v.showDropDownDetails = false;
        //        }
        //
        //
        //        v.properties.active = v.properties.active ? 'Active' : 'Inactive';
        //        v.properties.relationship_type = 'own' ? 'Owner' : v.properties.relationship_type;
        //    });
        //
        //    var parcelStyle = {
        //        "color": "#e54573",
        //        "stroke": "#e54573",
        //        "stroke-width": 1,
        //        "fill-opacity":.8,
        //        "stroke-opacity":.8
        //    };
        //
        //
        //    // If there are any parcels, load the map and zoom to parcel
        //    if(response.geometry) {
        //        var layer = L.geoJson(response, {style:parcelStyle}).addTo(map);
        //        map.fitBounds(layer.getBounds());
        //    } else {
        //        map.setView([lat,lng],zoom);
        //    }
        //
        //    return parcelService.getProjectParcelRelationshipHistory(cadastaProject.id, $stateParams.id);
        //
        //},function(err){
        //    $scope.overviewData = "Server Error";
        //});
        //
        //



    }]);


