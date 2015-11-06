var app = angular.module("app")
    .service("relationshipService", ['$http', '$q', 'ENV', function ($http, $q, ENV) {

        var service = {};

        /**
         * Get one relationships for a project
         * @returns {*}
         */
        service.getProjectRelationship = function (projectId, relationshipId) {

            var deferred = $q.defer();

            $http.get(ENV.apiCadastaRoot + '/projects/' + projectId + '/relationships/' + relationshipId + '/details?returnGeometry=true', {cache: false}).
                then(function (response) {
                    deferred.resolve(response.data.features[0]);
                }, function (response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        };

        /**
         * Get all relationships for a project
         * @returns {*}
         */
        service.getProjectRelationshipsList = function (projectId) {

            var deferred = $q.defer();

            $http.get(ENV.apiCadastaRoot + '/projects/' + projectId + '/relationships/relationships_list', {cache: false}).
                then(function (response) {
                    deferred.resolve(response.data.features);
                }, function (response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        };


        /**
         * Get all resources associated with a relationship
         * @returns {*}
         *
         */
        service.getProjectRelationshipResources = function(projectId, relationshipId){

            var deferred = $q.defer();

            $http.get(ENV.apiCadastaRoot +'/projects/'+ projectId + '/relationships/' + relationshipId + '/resources', { cache: false })
                .then(function(response) {
                    deferred.resolve(response.data.features);
                }, function(response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        };


        /**
         * Create a new relationship
         * @returns {*}
         *
         */
        service.createProjectRelationship = function(projectId, parcelId, layer, relationship){

            var deferred = $q.defer();

            var acquired_date = null;
            var how_acquired = null;
            var description = null;
            var geom = null;
            var parcel_id = parseInt(parcelId);


            if (relationship.acquisition_date) { acquired_date = relationship.acquisition_date;}
            if (relationship.acquired_type) { how_acquired = relationship.acquired_type;}
            if (relationship.description) { description = relationship.description;}
            if (layer) { geom = layer;}


            $http({
                method: "post",
                url: ENV.apiCadastaRoot + '/projects/' + projectId + '/relationships',
                data: JSON.stringify({
                    parcel_id: parcel_id,
                    ckan_user_id: null,
                    party_id: relationship.party.properties.id,
                    geojson: geom,
                    tenure_type: relationship.tenure_type,
                    acquired_date: acquired_date,
                    how_acquired: how_acquired,
                    description: description
                }),
                headers: {
                    'Content-type': 'application/json'
                }
            }).then(function (response) {
                deferred.resolve(response.data);
            }, function (response) {
                deferred.reject(response);
            });

            return deferred.promise;
        };



        /**
         * Updates a relationship via a patch request
         * @returns {*}
         * todo pass in a project and parcel id
         */
        service.updateProjectRelationship = function (projectId, relationshipId, layer, relationship) {

            var deferred = $q.defer();

            var acquired_date = null;
            var how_acquired = null;
            var description = null;
            var geom = null;

            if (relationship.acquired_date) { acquired_date = relationship.acquired_date;}
            if (relationship.tenure_type) { tenure_type = relationship.tenure_type;}
            if (relationship.description) { description = relationship.description;}
            if (relationship.how_acquired) { how_acquired = relationship.how_acquired;}
            if (layer) { geom = layer.geometry;}


            $http({
                method: "patch",
                url: ENV.apiCadastaRoot + '/projects/' + projectId + '/relationships/' + relationshipId,
                data: JSON.stringify({
                    geojson: geom,
                    tenure_type: relationship.tenure_type,
                    acquired_date: acquired_date,
                    how_acquired: how_acquired,
                    description: description
                }),
                headers: {
                    'Content-type': 'application/json'
                }
            }).then(function (response) {
                deferred.resolve(response.data);
            }, function (response) {
                deferred.reject(response);
            });

            return deferred.promise;
        };



        return service;
    }]);
