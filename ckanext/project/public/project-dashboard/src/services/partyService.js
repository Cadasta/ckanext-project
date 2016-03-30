var app = angular.module("app")
    .service("partyService", ['$http', '$q', 'ENV', function ($http, $q, ENV) {

        var service = {};

        /**
         * Get all parcels from parcel endpoint
         * @returns {*}
         */


        service.getProjectParties = function (projectId, limit, offset) {

            var deferred = $q.defer();

            $http.get(ENV.apiCKANRoot + '/cadasta_get_project_parties?project_id=' + projectId + '&limit=' + limit + '&offset=' + offset, {cache: false}).
                then(function (response) {
                     if(response.data && response.data.error) {
                        deferred.reject(response.data.error);
                     }
                    deferred.resolve(response);
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

            $http.get(ENV.apiCKANRoot + '/cadasta_get_project_party_details?project_id=' + projectId + "&party_id=" + partyId, {cache: false}).
                then(function (response) {
                     if(response.data && response.data.error) {
                        deferred.reject(response.data.error);
                     }
                    deferred.resolve(response.data.result.features[0]);
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

            $http.get(ENV.apiCKANRoot + '/cadasta_get_project_party_resources?project_id=' + projectId + "&party_id=" + partyId, {cache: false})
                .then(function (response) {
                    if(response.data && response.data.error) {
                        deferred.reject(response.data.error);
                     }
                    deferred.resolve(response.data.result);
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
                    url: ENV.apiCKANRoot + '/cadasta_create_project_party',
                    data: JSON.stringify({
                        project_id: projectId, // only used for CKAN proxy
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
                    if(response.data && response.data.error) {
                        deferred.reject(response.data.error);
                     }
                    deferred.resolve(response.data.result);
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
                    method: "post",
                    url: ENV.apiCKANRoot + '/cadasta_update_project_party',
                    data: JSON.stringify({
                        project_id: projectId, // only used for CKAN proxy
                        party_id: partyId, // only used for CKAN proxy
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
                     if(response.data && response.data.error) {
                        deferred.reject(response.data.error);
                     }
                    deferred.resolve(response.data.result);
                }, function (response) {
                    deferred.reject(response);
                });
            }

            return deferred.promise;
        };





        return service;
    }]);

