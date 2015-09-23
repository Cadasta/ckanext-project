app.controller("parcelCtrl", ['$scope', '$state', '$stateParams','parcelService','$rootScope','paramService', 'utilityService',function($scope, $state, $stateParams, parcelService,$rootScope,paramService,utilityService){

    var mapStr = $stateParams.map;

    // parse map query param
    var mapArr = mapStr.substring(1,mapStr.length-1).split(',');

    var lat = mapArr[0];
    var lng = mapArr[1];
    var zoom = mapArr[2];

    // setup map
    var map = L.map('parcelDetailsMap', {scrollWheelZoom:false});

    // After each pan or zoom
    map.on('moveend', function(){

        if($state.current.name !== 'tabs.parcels.parcel') {
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

    $scope.parcel = null;

    $scope.toggleDropdownDetails = function(obj){
        obj.showDropDownDetails = !obj.showDropDownDetails;
    };


    var promise = parcelService.parcelGet($stateParams.id);

    promise.then(function(response){

        $rootScope.$broadcast('parcel-details', {id:$stateParams.id});

        $scope.parcel = response.properties;

        // format dates
        $scope.parcel.time_created = utilityService.formatDate($scope.parcel.time_created);
        $scope.parcel.time_updated = utilityService.formatDate($scope.parcel.time_created);

        response.properties.parcel_history.forEach(function(val){
            val.time_created = utilityService.formatDate(val.time_created);
            val.time_updated = utilityService.formatDate(val.time_updated);
        });

        response.properties.relationships.forEach(function(val){
            val.time_created = utilityService.formatDate(val.time_created);
            val.time_updated = utilityService.formatDate(val.time_updated);
        });

        $scope.parcel_history = response.properties.parcel_history;

        $scope.relationships = response.properties.relationships;

        //update values for UI
        $scope.relationships.forEach(function(v){
            v.active = v.active ? 'Active' : 'Inactive';
            v.relationship_type = 'own' ? 'Owner' : v.relationship_type;
            v.showDropDownDetails = false;
        });

        // If there are any parcels, load the map and zoom to parcel
        if(response.geometry) {
            var layer = L.geoJson(response).addTo(map);
            map.fitBounds(layer.getBounds());
        } else {
            map.setView([lat,lng],zoom);
        }

        return parcelService.parcelRelationshipHistory($stateParams.id);

    },function(err){
        $scope.overviewData = "Server Error";
    });


    var resource_promise = parcelService.getParcelResources();

    resource_promise.then(function(response){

        $scope.parcelResources = response;

        //reformat date created of resources
        $scope.parcelResources.features.forEach(function(resource) {
            resource.properties.time_created = utilityService.formatDate(resource.properties.time_created);
        });

    },function(err){
        $scope.overviewData = "Server Error";
    });


}]);
