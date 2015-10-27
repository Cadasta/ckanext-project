var app = angular.module("app");

app.controller("relationshipsCtrl", ['$scope', '$state', '$stateParams', 'relationshipService', '$rootScope', 'utilityService', 'ckanId', 'cadastaProject', '$mdDialog',
    function ($scope, $state, $stateParams, relationshipService, $rootScope, utilityService, ckanId, cadastaProject, $mdDialog) {

        $rootScope.$broadcast('tab-change', {tab: 'Relationships'}); // notify breadcrumbs of tab on page load

        $scope.relationships = [];
        $scope.relationshipsList = [];

        // update tenure type on selection
        $scope.filterTenureType = function (type){
            $scope.TenureTypeModel = type;
        };



        var promise = relationshipService.getProjectRelationshipsList(cadastaProject.id);

        promise.then(function (response) {

            //format dates
            response.forEach(function (val) {
                val.properties.time_created = utilityService.formatDate(val.properties.time_created);
            })

            $scope.relationships = response;


        }, function (err) {
            $scope.overviewData = "Server Error";
        });


        $scope.addRelationshipModal = function(ev) {
            $mdDialog.show({
                scope: $scope,
                templateUrl: '/project-dashboard/src/partials/add_relationship.html',
                parent: angular.element(document.body),
                clickOutsideToClose:true
            })
        };


        $scope.cancel = function() {
            $mdDialog.cancel();
        };

        $scope.sort_by = [
            {
                label: 'None',
                type: 'all'
            },
            {
                label: 'Relationship ID',
                type: 'id'
            },
            {
                label: 'Name',
                type: 'name'
            },
            {
                label: 'How Acquired',
                type: 'how_aquired'
            },
            {
                label: 'Acquired Date',
                type: 'date_acquired'
            }
        ];

        $scope.tenure_types = [
            {
                type: 'all',
                label: 'All Types'
            },
            {
                type: 'own',
                label: 'Own'
            },
            {
                type: 'lease',
                label: 'Lease'
            },
            {
                type: 'occupy',
                label: 'Occupy'
            },
            {
                type: 'informal occupy',
                label: 'Informally Occupy'
            }
        ];


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
            case 'date_acquired':
                // create unique copy of array
                var arr = inputs.slice();
                // sort by date DESC
                arr.sort(function(a,b){
                    var a_date = new Date(a.properties.acquired_date);
                    var b_date = new Date(b.properties.acquired_date);
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
