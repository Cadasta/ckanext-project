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

        /**
         * Get [arty details
         * @param id party id from state params
         * @returns {*}
         */
        service.getProjectParty = function (projectId, partyId) {

            var deferred = $q.defer();

            $http.get(ENV.apiCadastaRoot + '/projects/' + projectId + '/parties/' + partyId, {cache: false}).
                then(function (response) {
                    deferred.resolve(response.data.features[0]);
                }, function (response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        };
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


        /**
         * Get all resources associated with a party
         * @returns {*}
         *
         */
        service.getProjectPartyResources = function (projectId, partyId) {

            var deferred = $q.defer();

            $http.get(ENV.apiCadastaRoot + '/projects/' + projectId + '/parties/' + partyId + '/resources', {cache: false})
                .then(function (response) {
                    deferred.resolve(response.data);
                }, function (response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        };

        /**
         * Creates a new party via a post request
         * @returns {*}
         *
         */
        service.createProjectParty = function (projectId, party) {

            var deferred = $q.defer();

            var first_name = null;
            var last_name = null;
            var group_name = null;
            var party_type = null;

            if (party.first_name) { first_name = party.first_name }
            if (party.last_name) { last_name = party.last_name }
            if (party.group_name) { group_name = party.group_name }
            if (party.party_type) { party_type = party.party_type }


            if (first_name || group_name) {
                $http({
                    method: "post",
                    url: ENV.apiCadastaRoot + '/projects/' + projectId + '/parties',
                    data: JSON.stringify({
                        first_name: first_name,
                        last_name: last_name,
                        group_name: group_name,
                        party_type: party_type
                    }),
                    headers: {
                        'Content-type': 'application/json'
                    }
                }).then(function (response) {
                    deferred.resolve(response.data);
                }, function (response) {
                    deferred.reject(response);
                });
            }

            return deferred.promise;
        };





        return service;
    }]);

