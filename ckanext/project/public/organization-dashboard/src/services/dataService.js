

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

            $http.get(ENV.apiCKANRoot + '/show_activity?project_id=1', { cache: false })
                .then(function(response) {
                    deferred.resolve(response.data);
                }, function(response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        };


        /**
         * This function grabs organization details including description
         * @returns {*}
         */
        service.getCKANOrgDetails = function(){

            var deferred = $q.defer();

            $http({
                url: '/api/3/action/organization_show?id=new-test-organization&include_datasets=true',
                type: 'GET',
                headers: { 'X-CKAN-API-KEY': '1e3617eb-1b63-4e45-b7d4-c748fbcff1fb' },
                dataType: 'json'

            })
                .then(function(response) {
                    deferred.resolve(response.data);
                }, function(response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        };


        /**
         * This function grabs CKAN activity list
         * @returns {*}
         *
         */
        service.getCKANOrgActivities = function(){

            var deferred = $q.defer();

            $http({
                url: '/api/3/action/organization_activity_list?id=new-test-organization',
                type: 'GET',
                headers: { 'X-CKAN-API-KEY': '1e3617eb-1b63-4e45-b7d4-c748fbcff1fb' },
                dataType: 'json'

            })
                .then(function(response) {
                    deferred.resolve(response.data);
                }, function(response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        };



        /**
         * This function formats a timestamp and returns it into a simple date mm/dd/yyyy
         * @returns {*}
         * todo this can be moved to its own service or to the shared folder
         */
        service.formatDate = function(date){
            var date_object = new Date(date);
            var month = date_object.getMonth();
            var day = date_object.getDay();
            var year = date_object.getFullYear();
            var date_object_formatted = month + "/" + day + "/" + year;

            return date_object_formatted;
        };


        return service;



    }]);
