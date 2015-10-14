var app = angular.module("app");

app.controller("parcelsCtrl", ['$scope', '$state', '$stateParams', 'parcelService', '$rootScope', 'utilityService', 'ckanId', 'cadastaProject', '$mdDialog',
    function ($scope, $state, $stateParams, parcelService, $rootScope, utilityService, ckanId, cadastaProject, $mdDialog) {

    $rootScope.$broadcast('tab-change', {tab: 'Parcels'}); // notify breadcrumbs of tab on page load

    $scope.parcels = [];
    $scope.parcelsList = [];

    // update tenure type on selection
    $scope.filterTenureType = function (type){
        $scope.TenureTypeModel = type;
    };

    $scope.sort_by = [
        {
            label: 'None',
            type: 'all'
        },
        {
            label: 'Parcel ID',
            type: 'id'
        },
        {
            label: 'Number of Active Relationships',
            type: 'num_relationships'
        },
        {
            label: 'Date Created',
            type: 'time_created'
        }
    ];

    $scope.tenure_types = [
        {
            type: 'all',
            label: 'All Types'
        },
        {
            type: 'own',
            label: 'Owned Parcels'
        },
        {
            type: 'lease',
            label: 'Leased Parcels'
        },
        {
            type: 'occupy',
            label: 'Occupied Parcels'
        },
        {
            type: 'informal occupy',
            label: 'Informally Occupied Parcels'
        }
    ];

    var promise = parcelService.getProjectParcels(cadastaProject.id);

    promise.then(function (response) {

        //format dates
        response.forEach(function (val) {
            val.properties.time_created = utilityService.formatDate(val.properties.time_created);
        })

        $scope.parcels = response;


    }, function (err) {
        $scope.overviewData = "Server Error";
    });


    $scope.addParcelModal = function(ev) {
        $mdDialog.show({
            scope: $scope,
            templateUrl: '/project-dashboard/src/partials/add_parcel.html',
            parent: angular.element(document.body),
            clickOutsideToClose:true
        })
    };


    $scope.cancel = function() {
        $mdDialog.cancel();
    };


}]);

// replace null with '-' for table
app.filter('emptyString', function (){
    return function(input){
        return input == null ? '-': input;
    }
});


// custom tenure type filter
app.filter('tenureType', function () {
    return function(inputs,filter_type) {
        var output = [];
        switch(filter_type){
            case 'own':
            case 'lease':
            case 'occupy':
            case 'informal occupy':
                //check if array contains filter selection
                inputs.forEach(function (input,i) {
                    if (input.properties.tenure_type.indexOf(filter_type) !== -1) {
                        output.push(input);
                    }
                });

                return output;
                break;
            case 'time_created':
                // create unique copy of array
                var arr = inputs.slice();
                // sort by date DESC
                arr.sort(function(a,b){
                    var a_date = new Date(a.properties.time_created);
                    var b_date = new Date(b.properties.time_created);
                    return   b_date - a_date;
                });
                return arr;
                break;
            case 'num_relationships':
                var arr = inputs.slice();
                // sort by DESC
                arr.sort(function(a,b){
                    return b.properties[filter_type] - a.properties[filter_type];
                });
                return arr;
                break;
            case 'id':
                // sort by ASC
                var arr = inputs.slice();
                arr.sort(function(a,b){
                    return a.properties[filter_type] - b.properties[filter_type];
                });
                return arr;
                break;
            default:
                return inputs;
        }
    };
});
