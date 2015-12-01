var app = angular.module("app");

app.controller("overviewCtrl", ['$scope', '$state', '$stateParams', '$location', 'dataService', 'paramService', 'utilityService', '$rootScope', 'ckanId', 'cadastaProject', '$mdDialog', 'USER_ROLES', 'PROJECT_CRUD_ROLES', 'TABS_USER_ROLES', 'userRole',
    function ($scope, $state, $stateParams, $location, dataService, paramService, utilityService, $rootScope, ckanId, cadastaProject, $mdDialog,USER_ROLES, PROJECT_CRUD_ROLES, TABS_USER_ROLES, userRole) {

        $rootScope.$broadcast('tab-change', {tab: 'Overview'}); // notify breadcrumbs of tab on page load

        $scope.$on('updated-parcel',function(){
            getOverviewData();
        });

        $scope.$on('new-parcel',function(){
            getOverviewData();
        });

        // Add user's role to the scope
        $scope.showEditLink = PROJECT_CRUD_ROLES.indexOf(userRole) > -1;
        $scope.nonPublic = TABS_USER_ROLES.indexOf(userRole) > -1;
        $scope.public = !$scope.nonPublic;

        // Get map querystring from state parameters
        var mapStr = $stateParams.map;

        // Parse map querystring
        var mapArr = mapStr.substring(1, mapStr.length - 1).split(',');
        var lat = mapArr[0];
        var lng = mapArr[1];
        var zoom = mapArr[2];

        $scope.submit = function () {
            if (form.file.$valid && $scope.file && !$scope.file.$error) {
                //$scope.upload($scope.file);

                $scope.upload($scope.file);
            }
        };

        // upload on file select or drop
        $scope.upload = function (file) {
            Upload.json({
                url: 'upload/url',
                data: {file: file, 'username': $scope.username}
            }).progress(function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
            }).success(function (data, status, headers, config) {
                console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
            }).error(function (data, status, headers, config) {
                console.log('error status: ' + status);
            })
        };

        // setup map
        var map = L.map('overviewMap', {scrollWheelZoom: false});

        // After each pan or zoom
        map.on('moveend', function () {

            if ($state.current.name !== 'tabs.overview') {
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
            accessToken: 'pk.eyJ1Ijoic3BhdGlhbGRldiIsImEiOiJKRGYyYUlRIn0.PuYcbpuC38WO6D1r7xdMdA'
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

        //add layer for adding parcels
        var parcelGroup = L.featureGroup().addTo(map);

        getOverviewData(); // Get overview data

        // update project resources in activity pane
        function getResources (projectId){
            var promise = dataService.getProjectResources(projectId);

            promise.then(function(response){

                response.features.forEach(function(v){
                    v.properties.time_created = utilityService.formatDate(v.properties.time_created);
                });

                $scope.overviewData.features[0].properties.project_resources = response.features;
            })
        }

        function getOverviewData() {
            var promise = dataService.getOverview(ckanId, cadastaProject.id);

            promise.then(function (response) {

                $scope.overviewData = response;
                $scope.overviewData.activityList = response.features[0].properties.project_activity;
                $scope.overviewData.description = response.features[0].properties.description;

                //reformat date created of resources
                $scope.overviewData.features[0].properties.project_resources.forEach(function (resource) {
                    resource.properties.time_created = utilityService.formatDate(resource.properties.time_created);
                });

                $scope.overviewData.features[0].properties.project_resources.forEach(function(resource) {
                    resource.properties.url = TABS_USER_ROLES.indexOf(userRole) > -1 ? resource.properties.url : '';
                });

                //reformat date created of activity list
                $scope.overviewData.features[0].properties.project_activity.forEach(function (activity) {
                    activity.properties.time_created = utilityService.formatDate(activity.properties.time_created);
                });

                var layer;

                var extentStyle = {
                    "color": "#256c97",
                    "stroke": "#256c97",
                    "weight": 2,
                    "fillOpacity": .1,
                    "opacity": .8
                };

                var parcelStyle = {
                    "color": "#e54573",
                    "stroke": "#e54573",
                    "weight": 1,
                    "fillOpacity": .5,
                    "opacity": .8,
                    "marker-color": "#e54573"
                };

                //clear layers
                parcelGroup.clearLayers();

                // If there is a project geom load map and zoom to it; else zoom to parcels
                if ($scope.overviewData.features[0].geometry) {
                    layer = L.geoJson($scope.overviewData.features[0], {
                        style: extentStyle,
                        pointToLayer: function (feature, latlng) {
                            return L.circle(latlng, 10, {"fillOpacity":.7, "opacity":.7, "weight":0} );
                        }
                    });
                    layer.addTo(parcelGroup);

                } else if ($scope.overviewData.features[0].properties.parcels.length > 0 && $scope.overviewData.features[0].properties.parcels[0].geometry) {
                    layer = L.geoJson($scope.overviewData.features[0].properties.parcels, {
                        style: parcelStyle,
                        pointToLayer: function (feature, latlng) {
                            return L.circle(latlng, 10, {"fillOpacity":.7, "opacity":.7, "weight":0} );
                        }
                    });
                    layer.addTo(parcelGroup);
                }

                if (layer === undefined) {
                    map.setView([lat, lng], zoom);
                } else {
                    map.fitBounds(layer.getBounds());
                }


            }, function (err) {
                $scope.overviewData = "Server Error";
            });
        }

        // listen for new resources
        $scope.$on('new-resource', function(e){
            getResources(cadastaProject.id);
        });

        // listen for new parcels to update geom and activity
        $scope.$on('new-parcel', function(e){
            getOverviewData();
        });

        // listen for new parcels to update geom and activity
        $scope.$on('updated-parcel', function(e){
            getOverviewData();
        });

        // listen for new parties to update geom and activity
        $scope.$on('new-party', function(e){
            getOverviewData();
        });

        // listen for updated parties to update geom and activity
        $scope.$on('updated-party', function(e){
            getOverviewData();
        });


        // listen for new relationships to update geom and activity
        $scope.$on('new-relationship', function(e){
            getOverviewData();
        });

        // listen for updated relationships to update geom and activity
        $scope.$on('updated-relationship', function(e){
            getOverviewData();
        });

    }]);



