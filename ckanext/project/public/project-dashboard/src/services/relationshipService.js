var app = angular.module("app")
    .service("relationshipService", ['$http', '$q', 'ENV', function ($http, $q, ENV) {

        var service = {};

        /**
         * Get one relationships for a project
         * @returns {*}
         */
        service.getProjectRelationship = function (projectId, relationshipId) {

            var deferred = $q.defer();

            $http.get(ENV.apiCadastaRoot + '/projects/' + projectId + '/relationships/' + relationshipId + '/details?returnGeometry=true', {cache: true}).
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


        return service;
    }]);
