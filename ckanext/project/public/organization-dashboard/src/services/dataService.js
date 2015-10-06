

var OrganizationDashboardApp = angular.module("OrganizationDashboardApp")
    .service("dataService", ['$http', '$q', 'ENV', function ($http, $q, ENV) {

        var service =  {};



        /**
         * Get all activities associated with a project
         * todo this is just a placeholder, should be updated to get org activity
         * @returns {*}
         */
        service.getAllActivities = function(){

            var deferred = $q.defer();

            $http.get(ENV.apiRoot + '/show_activity?project_id=1', { cache: false })
                .then(function(response) {
                    deferred.resolve(response.data);
                }, function(response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        };

        return service;
    }]);
