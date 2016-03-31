
var app = angular.module("app");


app.controller("tabsCtrl", ['$scope', '$rootScope','$state', '$stateParams','$location', 'dataService','paramService','userRole','TABS_USER_ROLES',
    function($scope, $rootScope,$state, $stateParams, $location, dataService, paramService, userRole, TABS_USER_ROLES) {

    // Add user's role to the scope
    $scope.showTabs = TABS_USER_ROLES.indexOf(userRole) > -1 ? true : false;
    //$scope.showTabs = true;




    /**
     * set tab selection and broadcast to breadcrumbs
     * @param tab
     */
    $scope.setTab = function(tab){

        $rootScope.$broadcast('tab-change', {tab: tab});

        if ($state.params && (tab=='Parties' || tab=='Relationships'|| tab=='Parcels' )) {

            var tabHash = {
               Parties: {tab_route:'parties.partylist'},
               Relationships: {tab_route:'relationships.relationshiplist'},
               Parcels: {tab_route:'parcels.parcellist'}
            }

            $state.go("tabs." + tabHash[tab].tab_route);
        }

    }

}]);
