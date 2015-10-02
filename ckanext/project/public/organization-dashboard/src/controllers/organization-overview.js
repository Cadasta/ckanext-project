var OrganizationDashboardApp = angular.module("OrganizationDashboardApp");


OrganizationDashboardApp.controller("orgOverviewCtrl", ['$scope', '$rootScope', '$state', '$stateParams', '$location', 'paramService', function ($scope, $rootScope, $state, $stateParams, $location, paramService) {


    $scope.organizationProjectsNum = 3;
    $scope.organizationDescription = "Intelligentsia squid occupy, food truck Blue Bottle sartorial narwhal cardigan shabby chic you probably haven't heard of them post-ironic readymade Williamsburg. " +
        "Wayfarers synth YOLO scenester distillery, Vice roof party XOXO shabby chic. Four loko lumbersexual Carles meditation. Church-key 8-bit typewriter flannel Bushwick disrupt mumblecore plaid. " +
        "Gastropub lo-fi migas actually. Wolf PBR&B master cleanse vinyl, hoodie vegan aesthetic Austin flexitarian retro Echo Park Shoreditch meditation Bushwick. XOXO +1 try-hard readymade Pitchfork."

}]);