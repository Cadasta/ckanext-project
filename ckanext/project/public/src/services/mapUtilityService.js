var app = angular.module("app")
    .service("mapUtilityService",function() {

        var service =  {};

        /**
         * This function validates the map routing parameter
         * @returns {*}
         */
        service.validateMapParam = function(mapParamValue){
            
            if(mapParamValue === undefined) {
                mapParamValue = '(0,0,0)';
            } else  if(mapParamValue.length < 7 || mapParamValue[0] !== '(' || mapParamValue[mapParamValue.length-1] !== ')') {
                console.error('Invalid map param:', mapParamValue, ', resetting to (0,0,0)');
                mapParamValue = '(0,0,0)';
            } else {
                // parse map query param
                var mapStr = mapParamValue;
                var mapArr = mapParamValue.substring(1,mapStr.length-1).split(',');
                var lat = Number(mapArr[0]);
                var lng = Number(mapArr[1]);
                var zoom = Number(mapArr[2]);

                if(isNaN(lat) || isNaN(lng) || isNaN(zoom)) {
                    console.warn('Invalid map param:', mapParamValue, ', resetting to (0,0,0)');
                    mapParamValue = '(0,0,0)';
                } else {

                    if(lat > 90 || lat < 0) {
                        console.warn('Invalid latitude param:', mapParamValue + ', resetting latitude to 0.');
                        lat = 0;
                    }
                    if (lng >180 || lng < -180) {
                        console.warn('Invalid longitude param:', mapParamValue + ', resetting longitude to 0.');
                        lng = 0
                    }
                    if(zoom < 0 ) {
                        console.warn('Invalid zoom param:', mapParamValue + ', resetting zoom to 0.');
                        zoom = 0;
                    }

                    mapParamValue = '(' +[lat,lng,zoom].join(',') + ')';
                }
            }
            return mapParamValue;
        };


        return service;
    });

