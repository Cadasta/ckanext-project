var app = angular.module("app");

app.controller("relationshipsCtrl", ['$scope', '$state', '$stateParams', 'relationshipService', '$rootScope', 'utilityService', 'ckanId', 'cadastaProject', '$mdDialog','sortByRelationship',
    function ($scope, $state, $stateParams, relationshipService, $rootScope, utilityService, ckanId, cadastaProject, $mdDialog, sortByRelationship) {

        $rootScope.$broadcast('tab-change', {tab: 'Relationships'}); // notify breadcrumbs of tab on page load

        $scope.relationships = [];
        $scope.relationshipsList = [];

        // update tenure type on selection
        $scope.setRelationshipFilter = function (type){
            $scope.relationshipFilter = type;
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

        $scope.sort_by = sortByRelationship;

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
