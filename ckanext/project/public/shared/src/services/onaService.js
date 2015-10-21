

var app = angular.module("app")
    .service("fieldDataService", ['$http', '$q', 'ENV', function ($http, $q, ENV) {

        var service =  {};

        /**
         * //TODO use real project_id
         * This function submits an ONA form to the Cadasta DB
         * @returns {*} success response
         *
         */
        service.submitForm = function(){

            //TODO get real project id
            $http.post(ENV.apiCadastaRoot + '/providers/ona/load-form/1', form)
                .then(function(response) {
                    cb(response.data);
                }, function(response) {
                    //TODO remove from ONA on error
                    cb(response.error);
                });
        };

        return service;
    }]);

