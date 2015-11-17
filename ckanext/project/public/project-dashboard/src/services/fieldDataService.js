var app = angular.module("app")
    .service("fieldDataService", ['$http', '$q', 'ENV', function ($http, $q, ENV) {

        var service =  {};

        /**
         * This function returns all the responses for a given field data survey
         * @returns {*}
         *
         */
        service.getResponses = function(cadastaProjectId, fieldDataId){

            var deferred = $q.defer();

            $http.get(ENV.apiCKANRoot + '/cadasta_get_project_fielddata_responses?project_id=' + cadastaProjectId + '&field_data_id=' + fieldDataId, { cache: false })
                .then(function(response) {
                    if(response.data && response.data.error){
                        deferred.reject(response.data.error);
                    }
                    deferred.resolve(response.data.result);
                }, function(response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        };

        /**
         * This function returns all the field data surveys for a given project
         * @returns {*}
         *
         */
        service.getFieldData = function(cadastaProjectId){

            var deferred = $q.defer();

            $http.get(ENV.apiCKANRoot + '/cadasta_get_project_fielddata?project_id=' + cadastaProjectId, { cache: false })
                .then(function(response) {
                    if(response.data && response.data.error){
                        deferred.reject(response.data.error);
                    }
                    deferred.resolve(response.data.result);
                }, function(response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        };


        service.updateStatusOfRespondents = function(cadastaProjectId, fieldDataId, respondent_id_array, status){
            var deferred = $q.defer();

            $http({
                method: "post",
                url: ENV.apiCKANRoot + '/cadasta_update_project_fielddata_respondents',
                data: JSON.stringify({
                    project_id: cadastaProjectId, // only for CKAN proxy
                    field_data_id: fieldDataId, // only for CKAN proxy
                    respondent_ids : respondent_id_array,
                    status: status
                }),
                headers: {
                    'Content-type': 'application/json'
                }
            }).then(function (response) {
                if(response.data && response.data.error){
                    deferred.reject(response.data.error);
                }
                deferred.resolve(response.data.result);
            }, function (response) {
                deferred.reject(response);
            });

            return deferred.promise;


        }

        return service;
    }])

