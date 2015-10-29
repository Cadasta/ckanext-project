var app = angular.module("app")
    .service("partyService", ['$http', '$q', 'ENV', function ($http, $q, ENV) {

        var service = {};

        /**
         * Get all parcels from parcel endpoint
         * @returns {*}
         */


        service.getProjectParties = function (projectId) {

            var deferred = $q.defer();

            $http.get(ENV.apiCadastaRoot + '/projects/' + projectId + '/parties', {cache: false}).
                then(function (response) {
                    deferred.resolve(response.data.features);
                }, function (response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        };

        ///**
        // * Get parcel details
        // * @param id parcel id from state params
        // * @returns {*}
        // */
        //service.getProjectParcel = function (projectId, parcelId) {
        //
        //    var deferred = $q.defer();
        //
        //    $http.get(ENV.apiCadastaRoot + '/projects/' + projectId + '/parcels/' + parcelId + '/details', {cache: false}).
        //        then(function (response) {
        //            deferred.resolve(response.data.features[0]);
        //        }, function (response) {
        //            deferred.reject(response);
        //        });
        //
        //    return deferred.promise;
        //};
        //
        //
        ///**
        // * Get parcels' relationship history
        // * @param id parcel id from state params
        // * @returns {*}
        // */
        //service.getProjectParcelRelationshipHistory = function (projectId, parcelId) {
        //
        //    var deferred = $q.defer();
        //
        //    $http.get(ENV.apiCadastaRoot + '/projects/' + projectId + '/parcels/' + parcelId + '/show_relationship_history', {cache: false}).
        //        then(function (response) {
        //            deferred.resolve(response.data.features);
        //        }, function (response) {
        //            deferred.reject(response);
        //        });
        //
        //    return deferred.promise;
        //};


        ///**
        // * Get all resources associated with a parcel
        // * @returns {*}
        // * todo pass in a project and parcel id
        // */
        //service.getProjectParcelResources = function (projectId, parcelId) {
        //
        //    var deferred = $q.defer();
        //
        //    $http.get(ENV.apiCadastaRoot + '/projects/' + projectId + '/parcels/' + parcelId + '/resources', {cache: false})
        //        .then(function (response) {
        //            deferred.resolve(response.data);
        //        }, function (response) {
        //            deferred.reject(response);
        //        });
        //
        //    return deferred.promise;
        //};




        return service;
    }]);

