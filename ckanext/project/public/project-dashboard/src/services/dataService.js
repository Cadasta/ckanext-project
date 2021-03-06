var app = angular.module("app")
    .service("dataService", ['$http', '$q', 'ENV', function ($http, $q, ENV) {

        var service =  {};

        service.getCadastaProject = function(ckanProjectId){

            var deferred = $q.defer();

            // Cadasta API
            $http.get(ENV.apiCKANRoot + '/cadasta_get_all_projects?outputFormat=JSON&ckan_id=' + ckanProjectId, { cache: true })
                .then(function(response) {
                     if(response.data && response.data.error) {
                        deferred.reject(response.data.error);
                     }
                     deferred.resolve(response.data.result[0]);
                }, function(err) {
                    deferred.reject(err);
                });

            // CKAN API for project description
            return deferred.promise;
        };


        /**
         * This function returns a single Cadasta project with geometry
         * @returns {*}
         *
         */
        service.getCadastaProjectDetails = function(cadastaProjectId){
            var deferred = $q.defer();

            // Cadasta API
            $http.get(ENV.apiCKANRoot + '/cadasta_get_project_details?returnGeometry=true&project_id=' + cadastaProjectId, { cache: false })
                .then(function(response) {
                    if(response.data && response.data.error){
                        deferred.reject(response.data.error);
                    }
                    deferred.resolve(response.data.result);
                }, function(err) {
                    deferred.reject(err);
                });

            // CKAN API for project description

            return deferred.promise;
        };



        /**
         * This function gets all of the data required for the parcel overview page
         * @returns {*}
         *
         */
        service.getOverview = function(ckanProjectId, cadastaProjectId){

            var ckanProject = service.getCkanProject(ckanProjectId);
            var cadastaProject = service.getCadastaOverview(cadastaProjectId);

            return $q.all([ckanProject, cadastaProject]).then(function(results){

                results[1].features[0].properties.description = results[0].notes;
                return  results[1];
            });
        };

        service.getCadastaOverview = function(cadastaProjectId){
            var deferred = $q.defer();

            // Cadasta API
            $http.get(ENV.apiCKANRoot + '/cadasta_get_project_overview?project_id=' + cadastaProjectId, { cache: false })
                .then(function(response) {
                    if( response.data && response.data.error ){
                        deferred.reject(response.data.error);
                    }
                    deferred.resolve(response.data.result);
                }, function(response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        };

        service.getCadastaMapData = function(cadastaProjectId){
            var deferred = $q.defer();

            // Cadasta API
            $http.get(ENV.apiCKANRoot + '/cadasta_get_project_mapdata?project_id=' + cadastaProjectId, { cache: false })
                .then(function(response) {
                    if( response.data && response.data.error ){
                        deferred.reject(response.data.error);
                    }
                    deferred.resolve(response.data.result);
                }, function(response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        };

        service.getProjectResources = function(cadastaProjectId, cache, limit, offset){
            var deferred = $q.defer();

            // Cadasta API
            $http.get(ENV.apiCKANRoot + '/cadasta_get_project_resources?project_id=' + cadastaProjectId + '&limit=' + limit + '&offset=' + offset, { cache: cache })
                .then(function(response) {
                    if( response.data && response.data.error ){
                        deferred.reject(response.data.error);
                    }
                    deferred.resolve(response);
                }, function(response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        };

        service.getCkanProject = function(ckanProjectId){

            var deferred = $q.defer();


            // CKAN API for project description
            $http.get(ENV.apiCKANRoot + '/package_show?id=' + ckanProjectId, { cache: false })
                .then(function(response) {
                    deferred.resolve(response.data.result);
                }, function(response) {
                    deferred.reject(response);
                });

            return deferred.promise;

        };

        /**
         * Get all activities associated with a project
         * @returns {*}
         */
        service.getProjectActivities = function(cadastaProjectId, limit, offset){

            var deferred = $q.defer();

            $http.get(ENV.apiCKANRoot + '/cadasta_get_project_activities?project_id=' + cadastaProjectId + '&limit=' + limit + '&offset=' + offset, { cache: false })
                .then(function(response) {
                    if(response.data && response.data.error){
                        deferred.reject(response.data.error);
                    }
                    deferred.resolve(response);
                }, function(response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        };


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

