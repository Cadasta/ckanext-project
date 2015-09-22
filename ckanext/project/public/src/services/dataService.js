

var app = angular.module("app")
    .service("dataService", ['$http', '$q', 'ENV', function ($http, $q, ENV) {

        var service =  {};

        /**
         * This function gets all of the data required for the parcel overview page
         * @returns {*}
         * todo pass in project id
         */
        service.overviewGet = function(){

            var deferred = $q.defer();

            $http.get(ENV.apiRoot + '/projects/1/overview', { cache: false })
                .then(function(response) {
                  deferred.resolve(response.data);
                }, function(response) {
                  deferred.reject(response);
                });

            return deferred.promise;
        };

        /**
         * Get all activities associated with a project
         * @returns {*}
         */
        service.getAllActivities = function(){

            var deferred = $q.defer();

            $http.get(ENV.apiRoot + '/show_activity', { cache: false })
                .then(function(response) {
                    deferred.resolve(response.data);
                }, function(response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        };


        /**
         * Get all resources associated with a project
         * @returns {*}
         */
        service.getAllResources = function(){

            var deferred = $q.defer();

            $http.get(ENV.apiRoot + '/resources', { cache: false })
                .then(function(response) {
                    deferred.resolve(response.data);
                }, function(response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        };

        //todo Is this being used?
        service.parcelGet = function(id){

            var deferred = $q.defer();

            $http.get('../src/temp-data/parcel.json', { cache: true }).
                then(function(response) {
                    deferred.resolve(response.data);
                }, function(response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        };

        return service;
  }])

