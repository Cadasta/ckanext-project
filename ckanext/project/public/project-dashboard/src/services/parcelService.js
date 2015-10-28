var app = angular.module("app")
    .service("parcelService", ['$http', '$q', 'ENV', function ($http, $q, ENV) {

        var service = {};

        /**
         * Get all parcels from parcel endpoint
         * @returns {*}
         */
        service.getProjectParcels = function (projectId) {

            var deferred = $q.defer();

            $http.get(ENV.apiCKANRoot + '/cadasta_get_project_parcels?cadasta_project_id=' + projectId, {cache: false}).
                then(function (response) {
                    deferred.resolve(response.data.result.features);
                }, function (response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        };

        /**
         * Get parcel details
         * @param id parcel id from state params
         * @returns {*}
         */
        service.getProjectParcel = function (projectId, parcelId) {

            var deferred = $q.defer();

            $http.get(ENV.apiCKANRoot + '/cadasta_get_project_parcel_details?project_id='+projectId+'&parcel_id='+parcelId, {cache: false}).
                then(function (response) {
                    deferred.resolve(response.data.result.features[0]);
                }, function (response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        };


        /**
         * Get parcels' relationship history
         * @param id parcel id from state params
         * @returns {*}
         */
        service.getProjectParcelRelationshipHistory = function (projectId, parcelId) {

            var deferred = $q.defer();

            $http.get(ENV.apiCKANRoot + '/cadasta_get_project_parcel_relationships?project_id='+projectId+'&parcel_id='+parcelId, {cache: false}).
                then(function (response) {
                    deferred.resolve(response.data.result.features);
                }, function (response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        };


        /**
         * Get all resources associated with a parcel
         * @returns {*}
         * todo pass in a project and parcel id
         */
        service.getProjectParcelResources = function (projectId, parcelId) {

            var deferred = $q.defer();

            $http.get(ENV.apiCKANRoot + '/cadasta_get_project_parcel_resources?project_id='+projectId+'&parcel_id='+parcelId, {cache: false})
                .then(function (response) {
                    deferred.resolve(response.data.result);
                }, function (response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        };


        /**
         * Creates a new parcel via a post request
         * @returns {*}
         * todo pass in a project and parcel id
         */
        service.createProjectParcel = function (projectId, geoJSON, parcel) {

            var deferred = $q.defer();

            var gov_pin = null;
            var description = " ";
            var landuse = null;

            if (parcel) {
                if (parcel.pinid) {
                    gov_pin = parcel.pinid;
                }
                if (parcel.notes) {
                    description = parcel.notes;
                }
                if (parcel.landuse) {
                    landuse = parcel.landuse;
                }
            }


            $http({
                method: "post",
                url: ENV.apiCKANRoot + '/cadasta_create_project_parcel',
                data: JSON.stringify({
                    project_id: projectId,
                    spatial_source: "digitized",
                    geojson: geoJSON.geometry,
                    description: description,
                    land_use: landuse,
                    gov_pin: gov_pin
                }),
                headers: {
                    'Content-type': 'application/json'
                }
            }).then(function (response) {
                deferred.resolve(response.data.result);
            }, function (response) {
                deferred.reject(response);
            });

            return deferred.promise;
        };

        /**
         * Updates a parcel via a post request
         * @returns {*}
         * todo pass in a project and parcel id
         */
        service.updateProjectParcel = function (projectId, parcelId, geoJSON, parcelProperties) {

            var deferred = $q.defer();

            var gov_pin = null;
            var description = " ";
            var landuse = null;
            var parcel_geoJSON = null;

            if (parcelProperties) {
                if (parcelProperties.pinid) {
                    gov_pin = parcelProperties.pinid;
                }
                if (parcelProperties.notes) {
                    description = parcelProperties.notes;
                }
                if (parcelProperties.landuse) {
                    landuse = parcelProperties.landuse;
                }
            }

            if (geoJSON) {
                parcel_geoJSON = geoJSON.geometry;
            }


            $http({
                method: "post",
                url: ENV.apiCKANRoot + '/cadasta_update_project_parcel',
                data: JSON.stringify({
                    project_id: projectId,
                    parcel_id: parcelId,
                    spatial_source: "digitized",
                    geojson: parcel_geoJSON,
                    description: description,
                    land_use: landuse,
                    gov_pin: gov_pin
                }),
                headers: {
                    'Content-type': 'application/json'
                }
            }).then(function (response) {
                deferred.resolve(response.data.result);
            }, function (response) {
                deferred.reject(response);
            });

            return deferred.promise;
        };


        return service;
    }]);

