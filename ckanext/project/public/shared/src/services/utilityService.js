var app = angular.module("app")
    .service("utilityService",function($mdToast) {

        var service =  {};

        /**
         * This function formats a timestamp and returns it into a simple date dd/mm/yyyy
         * @returns {*}
         */
        service.formatDate = function(dateString){
            var date = dateString.split("-").join("/").replace( /\.[0-9]+/g, '' );
            var date_object = new Date(date);
            var month = date_object.getMonth() + 1;
            var day = date_object.getDate();
            var year = date_object.getFullYear();
            var date_object_formatted = day + "/" + month + "/" + year;

            return date_object_formatted;
        };


        service.showToast = function(text) {
            $mdToast.show(
                $mdToast.simple()
                    .content(text)
                    .hideDelay(3000)
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

