app.controller("partyCtrl", ['$scope', '$state', '$stateParams','parcelService','$rootScope','paramService', 'utilityService', 'uploadResourceService', '$mdDialog', 'ckanId', 'cadastaProject', 'FileUploader', 'ENV',
    function($scope, $state, $stateParams, parcelService,$rootScope,paramService, utilityService, uploadResourceService, $mdDialog, ckanId, cadastaProject, FileUploader, ENV){


        $rootScope.$broadcast('tab-change', {tab: 'Parties'}); // notify breadcrumbs of tab on page load

        $rootScope.$broadcast('party-details', {id: $stateParams.id});

        $scope.clearPartyBreadCrumb = function () {
            $rootScope.$broadcast('clear-inner-party-tab');
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

            relationshipGroup.clearLayers();
            parcelGroup.clearLayers();

            //update values for UI
            $scope.relationships.forEach(function (v, i) {

                //todo update route using state param
                var popup_content = '<h3>Relationship ' + v.properties.id + '</h3><a href="#/relationships/' + v.properties.id + '"> See Full Details<i class="material-icons arrow-forward">arrow_forward</i></a>';


                if(v.geometry !== null){
                    layer = L.geoJson(v, {style: relationshipStyle});
                    layer.bindPopup(popup_content);
                    layer.addTo(relationshipGroup);
                    map.fitBounds(layer.getBounds());
                }


                v.showDropDownDetails = (i === 0);

                v.properties.active = v.properties.active ? 'Active' : 'Inactive';
                v.properties.relationship_type = 'own' ? 'Owner' : v.properties.relationship_type;

            });

            // If there are any parcels, load the map and zoom to parcel
            if (response.geometry) {
                layer = L.geoJson(response, {style: parcelStyle}).addTo(parcelGroup);
                map.fitBounds(layer.getBounds());
            } else {
                map.setView([lat, lng], zoom);
            }

            return parcelService.getProjectParcelRelationshipHistory(cadastaProject.id, $stateParams.id);

        }, function (err) {
            $scope.partyDetails = "Server Error";
        });


    }]);


