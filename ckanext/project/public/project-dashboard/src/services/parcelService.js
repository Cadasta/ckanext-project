var app = angular.module("app")
    .service("parcelService", ['$http', '$q', 'ENV', function ($http, $q, ENV) {

        var service = {};

        /**
         * Get all parcels from parcel endpoint
         * @returns {*}
         */

            //TODO get project id and pass as parameter in API call
        service.parcelsGet = function () {

            var deferred = $q.defer();

            $http.get(ENV.apiCadastaRoot + '/show_parcels_list', {cache: true}).
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
        service.parcelGet = function (id) {

            var deferred = $q.defer();

            $http.get(ENV.apiCadastaRoot +  '/parcels/' + id + '/details', {cache: true}).
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
        service.parcelRelationshipHistory = function (id) {

            var deferred = $q.defer();

            $http.get(ENV.apiCadastaRoot +  '/parcels/' + id + '/show_relationship_history', {cache: true}).
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
        service.getParcelResources = function(id){

            var deferred = $q.defer();

            $http.get(ENV.apiCadastaRoot + '/parcels/' + id + '/resources', { cache: true })
                .then(function(response) {
                    deferred.resolve(response.data);
                }, function(response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        };
        return service;
    }]);

