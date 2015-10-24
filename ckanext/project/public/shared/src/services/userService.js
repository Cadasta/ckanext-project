var app = angular.module("app")
    .service("userService", ['$http', '$q', 'ENV', function ($http, $q, ENV) {

        var service = {};

        service.getUserRole = function () {

            var deferred = $q.defer();

            $http.get(ENV.apiCKANRoot + '/user_role_show')
                .then(function (response) {
                    console.log(response.data.result);
                    deferred.resolve(response.data.result);
                }, function (err) {
                    deferred.reject(response);
                    console.log(err)
                });

            return deferred.promise;
        };

        return service;
    }
    ]);
