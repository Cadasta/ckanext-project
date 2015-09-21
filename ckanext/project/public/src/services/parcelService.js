var app = angular.module("app")
    .service("parcelService", ['$http', '$q', function ($http, $q) {

        var service = {};

        var environment = {local: 'http://localhost:9000/', dev: 'http://54.69.121.180:3000/'};

        /**
         * Get all parcels from parcel endpoint
         * @returns {*}
         */

            //TODO get project id and pass as parameter in API call
        service.parcelsGet = function () {

            var deferred = $q.defer();

            $http.get(environment.local + 'show_parcels_list', {cache: true}).
                then(function (response) {
                    deferred.resolve(response.data.features);
                }, function (response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        };

        /**
         * Get parcel details
         * @param id parcel id from state params
         * @returns {*}
         */
        service.parcelGet = function (id) {

            var deferred = $q.defer();

            $http.get(environment.local + 'parcels/' + id + '/details', {cache: true}).
                then(function (response) {
                    deferred.resolve(response.data.features[0]);
                }, function (response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        };

        return service;
    }]);

