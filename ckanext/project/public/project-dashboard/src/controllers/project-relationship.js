app.controller("relationshipCtrl", ['$scope', '$state', '$stateParams','parcelService','$rootScope','paramService', 'utilityService', 'uploadResourceService', '$mdDialog', 'ckanId', 'cadastaProject', 'FileUploader', 'ENV',
    function($scope, $state, $stateParams, parcelService,$rootScope,paramService, utilityService, uploadResourceService, $mdDialog, ckanId, cadastaProject, FileUploader, ENV){


        var mapStr = $stateParams.map;

        $rootScope.$broadcast('tab-change', {tab: 'Relationships'}); // notify breadcrumbs of tab on page load

        // parse map query param
        //var mapArr = mapStr.substring(1,mapStr.length-1).split(',');
        //
        //var lat = mapArr[0];
        //var lng = mapArr[1];
        //var zoom = mapArr[2];
        //
        //// setup map
        //var map = L.map('parcelDetailsMap', {scrollWheelZoom:false});
        //
        //// After each pan or zoom
        //map.on('moveend', function(){
        //
        //    if($state.current.name !== 'tabs.parcels.parcel') {
        //        return;
        //    }
        //
        //    var center = map.getCenter();
        //    var zoom = map.getZoom();
        //    var param  = '('+[center.lat, center.lng, zoom].join(',')+ ')';
        //    $stateParams.map = param;
        //    paramService.setStateParam($state.current.name, 'map', param);
        //    $state.go($state.current.name, $stateParams, {notify:false});
        //});
        //
        //L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        //    attribution: '',
        //    maxZoom: 18,
        //    id: 'spatialdev.map-rpljvvub',
        //    accessToken: 'pk.eyJ1Ijoic3BhdGlhbGRldiIsImEiOiJKRGYyYUlRIn0.PuYcbpuC38WO6D1r7xdMdA#3/0.00/0.00'
        //}).addTo(map);
        //
        //$scope.parcel = null;
        //
        //$scope.toggleDropdownDetails = function(obj){
        //    obj.showDropDownDetails = !obj.showDropDownDetails;
        //};
        //
        //$scope.clearParcelBreadCrumb = function () {
        //    $rootScope.$broadcast('clear-inner-tabs');
        //};
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


