

var app = angular.module("app")
    .service("uploadResourceService", ['$http', '$q', 'ENV', function ($http, $q, ENV) {

        var service =  {};

        /**
         * This function uploads a resource for a particular parcel in a project
         * todo pass in project id
         */
        service.uploadParcelResource = function(){

            var deferred = $q.defer();
            //todo remove hardcoding of resource numbers
            $http.post(ENV.apiCadastaRoot + '/resources/1/parcel/3',
                {
                    cache: false,
                    data: new FormData(this),
                    processData: false,
                    contentType: false,
                    error: function (err) {
                        console.log(err)
                    }
                })
                .then(function(response) {
                    deferred.resolve(response.data);
                }, function(response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        };


        return service;
    }]);
