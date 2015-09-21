app.controller("parcelCtrl", ['$scope', '$state', '$stateParams','parcelService','$rootScope', function($scope, $state, $stateParams, parcelService,$rootScope){

    //var mapStr = $stateParams.map;
    //
    //// parse map query param
    //var mapArr = mapStr.substring(1,mapStr.length-1).split(',');
    //
    //var lat = mapArr[0];
    //var lng = mapArr[1];
    //var zoom = mapArr[2];
    //
    //// setup map
    //var map = L.map('overviewMap', {scrollWheelZoom:false});
    //
    //// After each pan or zoom
    //map.on('moveend', function(){
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

    $scope.parcel = null;

    $scope.toggleDropdownDetails = function(obj){
        obj.showDropDownDetails = !obj.showDropDownDetails;
    };

    var promise = parcelService.parcelGet($stateParams.id);

    promise.then(function(response){

        $rootScope.$broadcast('parcel-details', {id:$stateParams.id});

        $scope.parcel = response.properties;

        $scope.parcel_history = response.properties.parcel_history;

        $scope.relationships = response.properties.relationships;

        $scope.relationships.forEach(function(v){
            v.active = v.active ? 'Active' : 'Inactive';
            v.relationship_type = 'own' ? 'Owner' : v.relationship_type;
            v.showDropDownDetails = false;
        })

    },function(err){
        $scope.overviewData = "Server Error";
    });

}]);
