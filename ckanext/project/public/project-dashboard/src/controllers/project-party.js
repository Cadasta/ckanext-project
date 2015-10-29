app.controller("partyCtrl", ['$scope', '$state', '$stateParams','partyService','$rootScope','paramService', 'utilityService', 'uploadResourceService', '$mdDialog', 'ckanId', 'cadastaProject', 'FileUploader', 'ENV',
    function($scope, $state, $stateParams, partyService,$rootScope,paramService, utilityService, uploadResourceService, $mdDialog, ckanId, cadastaProject, FileUploader, ENV){


        $rootScope.$broadcast('tab-change', {tab: 'Parties'}); // notify breadcrumbs of tab on page load

        $rootScope.$broadcast('party-details', {id: $stateParams.id});

        $scope.clearPartyBreadCrumb = function () {
            $rootScope.$broadcast('clear-inner-party-tab');
        };



        var promise = partyService.getProjectParty(cadastaProject.id, $stateParams.id);

        promise.then(function (response) {

            $rootScope.$broadcast('party-details', {id: $stateParams.id});

            $scope.party = response;

            //// format dates
            //$scope.party.time_created = utilityService.formatDate($scope.party.time_created);
            //$scope.party.time_updated = utilityService.formatDate($scope.party.time_created);
            //
            ////reformat party history dates
            //response.properties.party_history.forEach(function (val) {
            //    val.properties.time_created = utilityService.formatDate(val.properties.time_created);
            //    val.properties.time_updated = utilityService.formatDate(val.properties.time_updated);
            //});
            //
            ////reformat relationship dates
            //response.properties.relationships.forEach(function (val) {
            //    val.properties.time_created = utilityService.formatDate(val.properties.time_created);
            //    val.properties.time_updated = utilityService.formatDate(val.properties.time_updated);
            //});
            //
            //$scope.party_history = response.properties.party_history;
            //
            //$scope.relationships = response.properties.relationships;


        }, function (err) {
            $scope.partyDetails = "Server Error";
        });

        getPartyResources();

        function getPartyResources() {
            var resource_promise = partyService.getProjectPartyResources(cadastaProject.id, $stateParams.id);

            resource_promise.then(function (response) {

                $scope.partyResources = response;

                //reformat date created of resources
                $scope.partyResources.features.forEach(function (resource) {
                    resource.properties.time_created = utilityService.formatDate(resource.properties.time_created);
                });

            }, function (err) {
                $scope.partyResources = "Server Error";
            });

        }


        $scope.showAddResourceModal = function (ev) {

            $mdDialog.show({
                controller: resourceDialogController,
                templateUrl: '/project-dashboard/src/partials/data_upload.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            })
        };

        function resourceDialogController($scope, $mdDialog, FileUploader, ENV) {
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
            $scope.answer = function (answer) {
                $mdDialog.hide(answer);
            };

            $scope.uploader = new FileUploader({
                alias: 'filedata',
                url: ENV.apiCadastaRoot + '/projects/' + cadastaProject.id + '/party/' + $stateParams.id + '/resources'
            });

            $scope.uploader.onProgressItem = function (item, progress) {
                $scope.progress = progress;
            };

            // triggered when FileItem is has completed .upload()
            $scope.uploader.onCompleteItem = function (fileItem, response, status, headers) {
                if (response.message == "Success") {
                    $scope.response = 'File Successfully uploaded.';
                    $scope.error = ''; // clear error
                    $scope.uploader.clearQueue();

                    getParcelResources(false);
                    $rootScope.$broadcast('new-resource'); // broadcast new resources to the app
                }
            };

            $scope.uploader.onAfterAddingFile = function () {
                //remove previous item from queue
                if ($scope.uploader.queue.length > 1) {
                    $scope.uploader.removeFromQueue(0);
                }
            };

            $scope.uploader.onErrorItem = function (item, response, status, headers) {
                if (response.type == "duplicate") {
                    $scope.error = 'This resource already exists. Rename resource to complete upload.'
                } else {
                    $scope.error = response.error;
                }

                $scope.uploader.clearQueue();
            };

        }



    }]);


