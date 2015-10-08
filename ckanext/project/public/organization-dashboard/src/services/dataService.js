

var OrganizationDashboardApp = angular.module("OrganizationDashboardApp")
    .service("dataService", ['$http', '$q', 'ENV', function ($http, $q, ENV) {

        var service =  {};



        /**
         * This function grabs organization details including description
         * @returns {*}
         */
        service.getCKANOrgDetails = function(ckanOrgId){

            var deferred = $q.defer();

            $http({
                url: ENV.apiCKANRoot + '/organization_show?id=' + ckanOrgId + '&include_datasets=true',
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
        service.getCKANOrgActivities = function(ckanOrgId){

            var deferred = $q.defer();

            $http({
                url: ENV.apiCKANRoot + '/organization_activity_list?id=' + ckanOrgId,
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
