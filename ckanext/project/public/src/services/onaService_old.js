

var app = angular.module("app")
    .service("fieldDataService", ['$http', '$q', 'ENV', function ($http, $q, ENV) {

        var service =  {};

        service.getOnaForm = function(formid){

            var options = {
                "Authorization": "Token 74756f0ab0da149f649e9074c529b633f3daaa02"
            };

            $http.get('http://54.245.82.92/api/v1/forms/'+formid, options)
                .then(function(response) {
                    deferred.resolve(response.data);
                }, function(response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        };


        /**
         * //TODO use real project_id
         * This function submits an ONA form to the Cadasta DB
         * @returns {*} success response
         *
         */
        service.submitForm = function(form, cb){


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

