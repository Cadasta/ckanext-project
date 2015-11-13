var app = angular.module("OrganizationDashboardApp")
    .service("userOrgService", ['$http', '$q', 'ENV', function ($http, $q, ENV) {

        var service = {};

        service.getUserRole = function () {

            var deferred = $q.defer();

            $http.get(ENV.apiCKANRoot + '/user_role_show')
                .then(function (response) {
                    deferred.resolve(response.data.result);
                }, function (err) {
                    deferred.reject(response);
                });

            return deferred.promise;
        };

        return service;
    }
    ]);
