

var app = angular.module("app")
    .service("dataService", ['$http', '$q', function ($http, $q) {

        var service =  {};

        service.overviewGet = function(){

            var deferred = $q.defer();

            $http.get('http://localhost:9000/project_overview/1?returnGeometry=true', { cache: true }).
                then(function(response) {
                  deferred.resolve(response.data);
                }, function(response) {
                  deferred.reject(response);
                });

            return deferred.promise;
        };


        service.parcelsGet = function(){

            var deferred = $q.defer();

            $http.get('../src/temp-data/parcels.json', { cache: true }).
                then(function(response) {
                    deferred.resolve(response.data);
                }, function(response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        };

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

