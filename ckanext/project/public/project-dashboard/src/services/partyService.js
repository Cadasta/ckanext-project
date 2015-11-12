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

            $http.get(ENV.apiCadastaRoot + '/projects/' + projectId + '/parties/' + partyId + '/details', {cache: false}).
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

            var full_name = null, group_name = null, party_type = null,
                national_id = null, dob = null, gender = null, description = null;

            if (party.full_name) { full_name = party.full_name }
            if (party.group_name) { group_name = party.group_name }
            if (party.party_type) { party_type = party.party_type }
            if (party.national_id) { national_id = party.national_id }
            if (party.dob) { dob = party.dob }
            if (party.gender) { gender = party.gender }
            if (party.description) { description = party.description }


            if (full_name || group_name) {
                $http({
                    method: "post",
                    url: ENV.apiCadastaRoot + '/projects/' + projectId + '/parties',
                    data: JSON.stringify({
                        full_name: full_name,
                        group_name: group_name,
                        party_type: party_type,
                        national_id: national_id,
                        dob: dob,
                        gender: gender,
                        notes: description
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




        /**
         * Updates a new party via a patch request
         * @returns {*}
         *
         */
        service.updateProjectParty = function (projectId, partyId, party) {

            var deferred = $q.defer();

            var full_name = null, group_name = null, party_type = null,
                national_id = null, dob = null, gender = null, description = null;

            if (party.full_name) { full_name = party.full_name }
            if (party.group_name) { group_name = party.group_name }
            if (party.party_type) { party_type = party.party_type }
            if (party.national_id) { national_id = party.national_id }
            if (party.dob) { dob = party.dob }
            if (party.gender) { gender = party.gender }
            if (party.description) { description = party.description }


            if (full_name || group_name) {
                $http({
                    method: "patch",
                    url: ENV.apiCadastaRoot + '/projects/' + projectId + '/parties/' + partyId,
                    data: JSON.stringify({
                        full_name: full_name,
                        group_name: group_name,
                        party_type: party_type,
                        national_id: national_id,
                        dob: dob,
                        gender: gender,
                        notes: description
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

