var app = angular.module("app")
    .service("relationshipService", ['$http', '$q', 'ENV', function ($http, $q, ENV) {

        var service = {};

        /**
         * Get all relationships for a project
         * @returns {*}
         */

            //TODO update endpoint to pass id in get relationships
        service.getProjectRelationships = function (projectId) {

            var deferred = $q.defer();

            $http.get(ENV.apiCadastaRoot + '/relationships', {cache: true}).
                then(function (response) {
                    deferred.resolve(response.data.features);
                }, function (response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        };



        return service;
    }]);

