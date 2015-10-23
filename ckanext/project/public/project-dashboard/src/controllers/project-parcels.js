var app = angular.module("app");

app.controller("parcelsCtrl", ['$scope', '$state', '$stateParams', 'parcelService', 'dataService', '$rootScope', 'utilityService', 'ckanId', 'cadastaProject', '$mdDialog', '$location',
    function ($scope, $state, $stateParams, parcelService, dataService, $rootScope, utilityService, ckanId, cadastaProject, $mdDialog, $location) {

        $rootScope.$broadcast('tab-change', {tab: 'Parcels'}); // notify breadcrumbs of tab on page load

        $scope.parcels = [];
        $scope.parcelsList = [];

        // update tenure type on selection
        $scope.filterTenureType = function (type) {
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

        getParcels();

        function getParcels() {
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
        }

        //modal for adding a parcel
        $scope.addParcelModal = function (ev) {
            $mdDialog.show({
                templateUrl: '/project-dashboard/src/partials/add_parcel.html',
                controller: addParcelCtrl,
                parent: angular.element(document.body),
                clickOutsideToClose: false,
                onComplete: addMap,
                locals: {cadastaProject: cadastaProject}
            })
        };


        function addMap() {

            var map = L.map('addParcelMap');

            L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
                attribution: '',
                id: 'spatialdev.map-rpljvvub',
                zoomControl: true,
                accessToken: 'pk.eyJ1Ijoic3BhdGlhbGRldiIsImEiOiJKRGYyYUlRIn0.PuYcbpuC38WO6D1r7xdMdA#3/0.00/0.00'
            }).addTo(map);


            var featureGroup = L.featureGroup().addTo(map);

            var editIcon = L.icon({
                iconUrl: '/images/pink_marker.png',
                iconSize: [30, 30]
            });


            var options = {
                draw: {
                    marker: {
                        icon : editIcon
                    },
                    circle: false
                },
                edit: {
                    featureGroup: featureGroup
                }
            };

            var drawControl = new L.Control.Draw(options).addTo(map);

            //when a new parcel is added, save the layer to a feature group
            map.on('draw:created', function (e) {
                featureGroup.addLayer(e.layer);
                $scope.layer = e.layer;
            });

            //only allow one parcel to be drawn at a time
            map.on('draw:drawstart', function (e) {
                featureGroup.clearLayers();
            });




            var promise = dataService.getCadastaProjectDetails(cadastaProject.id);

            promise.then(function(response) {
                // If there is a project geom load map and zoom to it; else zoom to parcels
                console.log(response);
                var layer;

                var extentStyle = {
                    "color": "#256c97",
                    "stroke": "#256c97",
                    "stroke-width": 1,
                    "fill-opacity":.1,
                    "stroke-opacity":.7
                };


                if(response.features[0].geometry) {

                    var layer = L.geoJson(response.features[0], {style: extentStyle});
                    layer.addTo(map);
                }

                if(layer === undefined){
                    map.setView([19,-15],2);
                } else {
                    map.fitBounds(layer.getBounds());
                }
            });

        }

        //todo FIX i am not sure if this is the right way to grab data between scopes
        function getLayer() {
            return $scope.layer;
        }


        function addParcelCtrl($scope, $mdDialog) {

            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.cadastaProjectId = cadastaProject.id;

            $scope.saveNewParcel = function (projectId) {

                var layer = getLayer();

                if (layer === undefined) {
                    $scope.parcelCreated = "please draw parcel geometry before saving";
                } else {

                    var createParcel = parcelService.createProjectParcel(projectId, layer.toGeoJSON(), $scope.parcel);

                    createParcel.then(function (response) {
                        if (response.cadasta_parcel_id){

                            $scope.parcelCreated = 'parcel sucessfully added';

                            $rootScope.$broadcast('new-parcel');
                            getParcels();

                            var timeoutID = window.setTimeout(function() {
                                    $scope.cancel();
                                $location.path('/parcels/' + response.cadasta_parcel_id);
                                }, 300);
                        }
                    }).catch(function(err){

                        $scope.parcelCreated ='unable to create parcel';
                    });
                }
            }
        }

    }]);

// replace null with '-' for table
app.filter('emptyString', function () {
    return function (input) {
        return input == null ? '-' : input;
    }
});


// custom tenure type filter
app.filter('tenureType', function () {
    return function (inputs, filter_type) {
        var output = [];
        switch (filter_type) {
            case 'own':
            case 'lease':
            case 'occupy':
            case 'informal occupy':
                //check if array contains filter selection
                inputs.forEach(function (input, i) {
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
                arr.sort(function (a, b) {
                    var a_date = new Date(a.properties.time_created);
                    var b_date = new Date(b.properties.time_created);
                    return b_date - a_date;
                });
                return arr;
                break;
            case 'num_relationships':
                var arr = inputs.slice();
                // sort by DESC
                arr.sort(function (a, b) {
                    return b.properties[filter_type] - a.properties[filter_type];
                });
                return arr;
                break;
            case 'id':
                // sort by ASC
                var arr = inputs.slice();
                arr.sort(function (a, b) {
                    return a.properties[filter_type] - b.properties[filter_type];
                });
                return arr;
                break;
            default:
                return inputs;
        }
    };
});
