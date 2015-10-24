var app = angular.module("app")
    .service("parcelService", ['$http', '$q', 'ENV', function ($http, $q, ENV) {

        var service = {};

        /**
         * Get all parcels from parcel endpoint
         * @returns {*}
         */

            //TODO get project id and pass as parameter in API call
        service.getProjectParcels = function (projectId) {

            var deferred = $q.defer();

            $http.get(ENV.apiCadastaRoot + '/projects/' + projectId + '/parcels_list', {cache: false}).
                then(function (response) {
                    deferred.resolve(response.data.features);
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

            $http.get(ENV.apiCadastaRoot +  '/projects/'+ projectId + '/parcels/' + parcelId + '/details', {cache: false}).
                then(function (response) {
                    deferred.resolve(response.data.features[0]);
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

            $http.get(ENV.apiCadastaRoot +  '/projects/'+ projectId + '/parcels/' + parcelId  + '/show_relationship_history', {cache: false}).
                then(function (response) {
                    deferred.resolve(response.data.features);
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
        service.getProjectParcelResources = function(projectId, parcelId){

            var deferred = $q.defer();

            $http.get(ENV.apiCadastaRoot +'/projects/'+ projectId + '/parcels/' + parcelId + '/resources', { cache: false })
                .then(function(response) {
                    deferred.resolve(response.data);
                }, function(response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        };


        /**
         * Creates a new parcel via a post request
         * @returns {*}
         * todo pass in a project and parcel id
         */
        service.createProjectParcel = function(projectId, geoJSON, parcel){

            var deferred = $q.defer();

            var gov_pin = null;
            var description = " ";
            var landuse = null;

            if (parcel) {
                if (parcel.pinid){ gov_pin = parcel.pinid; }
                if (parcel.notes){ description = parcel.notes; }
                if (parcel.landuse){ landuse = parcel.landuse; }
            }


            $http({
                method: "post",
                url: ENV.apiCadastaRoot +'/projects/'+ projectId + '/parcels',
                data: JSON.stringify({
                    project_id: projectId,
                    spatial_source: "digitized",
                    geojson: geoJSON.geometry,
                    description: description,
                    land_use: landuse,
                    gov_pin : gov_pin
                }),
                headers: {
                    'Content-type': 'application/json'
                }
            }).then(function(response) {
                    deferred.resolve(response.data);
                }, function(response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        };

        /**
         * Updates a parcel via a post request
         * @returns {*}
         * todo pass in a project and parcel id
         */
        service.updateProjectParcel = function(projectId, parcelId, geoJSON, parcel){

            var deferred = $q.defer();

            var gov_pin = null;
            var description = " ";
            var landuse = null;

            if (parcel) {
                if (parcel.pinid){ gov_pin = parcel.pinid; }
                if (parcel.notes){ description = parcel.notes; }
                if (parcel.landuse){ landuse = parcel.landuse; }
            }


            $http({
                method: "patch",
                url: ENV.apiCadastaRoot +'/projects/'+ projectId + '/parcels/' + parcelId,
                data: JSON.stringify({
                    spatial_source: "digitized",
                    geojson: geoJSON.geometry,
                    description: description,
                    land_use: landuse,
                    gov_pin : gov_pin
                }),
                headers: {
                    'Content-type': 'application/json'
                }
            }).then(function(response) {
                deferred.resolve(response.data);
            }, function(response) {
                deferred.reject(response);
            });

            return deferred.promise;
        };



        return service;
    }]);

