

var app = angular.module("app")
    .service("dataService", ['$http', '$q', 'ENV', function ($http, $q, ENV) {

        var service =  {};

        service.getCadastaProject = function(ckanProjectId){

            var deferred = $q.defer();

            // Cadasta API
            $http.get(ENV.apiCadastaRoot + '/projects?outputFormat=JSON&ckan_id=' + ckanProjectId, { cache: true })
                .then(function(response) {
                    deferred.resolve(response.data[0]);
                }, function(err) {
                    deferred.reject(err);
                });

            // CKAN API for project description

            return deferred.promise;
        };

        /**
         * This function gets all of the data required for the parcel overview page
         * @returns {*}
         * todo pass in project id
         */
        service.overviewGet = function(ckanProjectId, cadastaProjectId){

            var ckanProject = service.ckanProject(ckanProjectId);
            var cadastaProject = service.cadastaProject(cadastaProjectId);

            return $q.all([ckanProject, cadastaProject]).then(function(results){

                results[1].features[0].properties.description = results[0].notes;
                return  results[1];
            });
        };

        service.cadastaProject = function(cadastaProjectId){
            var deferred = $q.defer();

            // Cadasta API
            $http.get(ENV.apiCadastaRoot + '/projects/' + cadastaProjectId + '/overview', { cache: true })
                .then(function(response) {
                    deferred.resolve(response.data);
                }, function(response) {
                    deferred.reject(response);
                });


            return deferred.promise;
        };

        service.ckanProject = function(ckanProjectId){

            var deferred = $q.defer();


            // CKAN API for project description
            $http.get(ENV.apiCKANRoot + '/package_show?id=' + ckanProjectId, {cache: true})
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
        service.getAllActivities = function(cadastaProjectId){

            var deferred = $q.defer();

            $http.get(ENV.apiCadastaRoot + '/show_activity?project_id=' + cadastaProjectId, { cache: true })
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

            $http.get(ENV.apiCadastaRoot + '/resources', { cache: true })
                .then(function(response) {
                    deferred.resolve(response.data);
                }, function(response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        };

        //todo pass in project_id as a parameter
        service.getProjectParcels = function(id){

            var deferred = $q.defer();

            $http.get(ENV.apiCadastaRoot + '/parcels?project_id=1', { cache: true })
                .then(function(response) {
                    deferred.resolve(response.data);
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

