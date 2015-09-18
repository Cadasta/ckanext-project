app.controller("parcelCtrl", ['$scope', '$state', '$stateParams','parcelService','$rootScope', function($scope, $state, $stateParams, parcelService,$rootScope){

    if($state.current.name !== "tabs.parcels.parcel") {
        return;
    }

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
