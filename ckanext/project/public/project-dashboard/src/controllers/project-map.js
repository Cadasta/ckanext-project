var app = angular.module("app");

app.controller("projectMapCtrl", ['$scope', '$state', '$stateParams', '$location', 'dataService', 'paramService', 'utilityService', '$rootScope', 'ckanId', 'cadastaProject',
    function ($scope, $state, $stateParams, $location, dataService, paramService, utilityService, $rootScope, ckanId, cadastaProject) {

        var mapStr = $stateParams.map;

        $rootScope.$broadcast('tab-change', {tab: 'Map'}); // notify breadcrumbs of tab on page load

        $scope.$on('updated-parcel',function(){
            getMapData();
        });

        $scope.$on('new-parcel',function(){
            getMapData();
        });

        // parse map query param
        var mapArr = mapStr.substring(1, mapStr.length - 1).split(',');

        var lat = mapArr[0];
        var lng = mapArr[1];
        var zoom = mapArr[2];

        // setup map
        var map = L.map('projectBigMap', {scrollWheelZoom: true});

        $scope.map = map; //expose map for testing

        // After each pan or zoom
        map.on('moveend', function () {

            if ($state.current.name !== 'tabs.map') {
                return;
            }

            var center = map.getCenter();
            var zoom = map.getZoom();
            var param = '(' + [center.lat, center.lng, zoom].join(',') + ')';
            $stateParams.map = param;
            paramService.setStateParam($state.current.name, 'map', param);
            $state.go($state.current.name, $stateParams, {notify: false});
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

        var overlays = {"Digital Globe Satellite": dg_satellite, "Standard OpenStreetMap": osm};

        L.control.layers(overlays,null, {
            collapsed:true
        }).addTo(map);

        //add layer for adding parcels
        var parcelGroup = L.featureGroup().addTo(map);
        var projectLayer;

        var parcelStyle = {
            "color": "#e54573",
            "stroke": "#e54573",
            "stroke-width": 1,
            "fill-opacity": .8,
            "stroke-opacity": .8,
            "marker-color": "#e54573"
        };

        var ExtentStyle = {
            "color": "#256c97",
            "stroke": "#256c97",
            "stroke-width": 1,
            "fill-opacity": .1,
            "stroke-opacity": .7,
            "clickable":false
        };

        getMapData();

        function getMapData() {
            // Get overview data
            var promise = dataService.getCadastaMapData(cadastaProject.id);

            promise.then(function (response) {

                //clear layers
                if(projectLayer) {
                    projectLayer.removeLayer();
                }
                parcelGroup.clearLayers();

                // If there is a project extent add it to the map
                projectLayer = L.geoJson(response.project.features, {
                    style: ExtentStyle,
                    pointToLayer: function (feature, latlng) {
                        return L.circle(latlng, 5, ExtentStyle);
                    }
                });
                projectLayer.addTo(map);

                response.parcels.features.forEach(function (parcel) {
                    // only draw if geometry exits
                    if(parcel.geometry) {
                        var popup_content = '<h3>Parcel ' + parcel.properties.id + '</h3><a href="#/parcels/' + parcel.properties.id + '"> See Full Details<i class="material-icons arrow-forward">arrow_forward</i></a>';
                        var parcelToAdd = L.geoJson(parcel, {
                            style: parcelStyle,
                            pointToLayer: function (feature, latlng) {
                                return L.circle(latlng, 10, {"fillOpacity": .7, "opacity": .7, "weight": 0});
                            }
                        });
                        parcelToAdd.bindPopup(popup_content);
                        parcelToAdd.addTo(parcelGroup);
                    }
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
        }


    }]);

