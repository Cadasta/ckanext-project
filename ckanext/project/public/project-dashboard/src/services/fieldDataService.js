var app = angular.module("app")
    .service("fieldDataService", ['$http', '$q', 'ENV', function ($http, $q, ENV) {

        var service =  {};

        /**
         * This function returns all the responses for a given field data survey
         * @returns {*}
         *
         */
        service.getResponses = function(cadastaProjectId, fieldDataId){

            var deferred = $q.defer();

            $http.get(ENV.apiCadastaRoot + '/projects/' + cadastaProjectId + '/fieldData/' + fieldDataId + '/show_responses', { cache: false })
                .then(function(response) {
                    deferred.resolve(response.data);
                }, function(response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        };

        /**
         * This function returns all the field data surveys for a given project
         * @returns {*}
         *
         */
        service.getFieldData = function(cadastaProjectId){

            var deferred = $q.defer();

            $http.get(ENV.apiCadastaRoot + '/projects/' + cadastaProjectId + '/fieldData/', { cache: false })
                .then(function(response) {
                    deferred.resolve(response.data);
                }, function(response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        };

        return service;
    }])

