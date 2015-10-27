var app = angular.module("app")
    .service("relationshipService", ['$http', '$q', 'ENV', function ($http, $q, ENV) {

        var service = {};

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
        service.getProjectRelationshipResources = function(projectId, resourceId){

            var deferred = $q.defer();

            $http.get(ENV.apiCadastaRoot +'/projects/'+ projectId + '/relationships/' + resourceId + '/resources', { cache: false })
                .then(function(response) {
                    deferred.resolve(response.data);
                }, function(response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        };


        return service;
    }]);

