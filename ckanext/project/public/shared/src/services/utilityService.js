var app = angular.module("app")
    .service("utilityService",function($mdToast) {

        var service =  {};

        /**
         * This function formats a timestamp and returns it into a simple date dd/mm/yyyy
         * @returns {*}
         */
        service.formatDate = function(dateString){
            if(!(dateString)) return;
            /**
             * some dates return with microseconds and an offset
             * while other dates return with one or the other
             * handle all cases
             */
            var date = dateString.split("-").join("/")
                                    .replace(/\..*/g,'')
                                    .replace(/\+[0-9]+$/g,'')
                                    .replace(/T/,' ');
            var date_object = new Date(date);
            var month = date_object.getMonth() + 1;
            var day = date_object.getDate();
            var year = date_object.getFullYear();
            var date_object_formatted = day + "/" + month + "/" + year;

            return date_object_formatted;
        };

        /**
        * function parses a ISO 8601 date safetly since
        * IE and Safari cannot handle microseconds
        * @returns Date Object
        */
        service.parseDate = function(dateString){
            if(!(dateString)) return;
            /**
             * some dates return with microseconds and an offset
             * while other dates return with one or the other
             * handle all cases
             */
            var date = dateString.split("-").join("/")
                                    .replace(/\..*/g,'')
                                    .replace(/\+[0-9]+$/g,'')
                                    .replace(/T/, ' ');
            return new Date(date);
        };

        service.showToast = function(text) {
            $mdToast.show(
                $mdToast.simple()
                    .content(text)
                    .hideDelay(4000)
                    .position('top right')
            );
        }

        service.showToastBottomRight = function(text) {
            $mdToast.show(
                $mdToast.simple()
                    .content(text)
                    .hideDelay(3000)
                    .position('bottom right')
            );
        }

        return service;
    });
