

var app = angular.module("app")
    .service("onaService", ['$http', '$q', 'ENV', function ($http, $q, ENV) {

        var service =  {};

        /**
         * This function gets all of the data required for the parcel overview page
         * @returns {*}
         * todo pass in project id
         */
        service.submitSurvey = function(){

            var deferred = $q.defer();

            var opts = {
                "headers":'Authorization'
            }

            $http.post('https://ona.io/api/v1/forms', { cache: false })
                .then(function(response) {
                    deferred.resolve(response.data);
                }, function(response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        };


        return service;
    }])

