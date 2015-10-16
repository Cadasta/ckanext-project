var app = angular.module("app")
    .service("utilityService",function() {

        var service =  {};

        /**
         * This function formats a timestamp and returns it into a simple date mm/dd/yyyy
         * @returns {*}
         */
        service.formatDate = function(date){
            var date_object = new Date(date);
            var month = date_object.getMonth() + 1;
            var day = date_object.getDate();
            var year = date_object.getFullYear();
            var date_object_formatted = month + "/" + day + "/" + year;

            return date_object_formatted;
        };


        return service;
    });

