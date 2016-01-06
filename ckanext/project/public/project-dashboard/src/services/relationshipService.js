var app = angular.module("app")
.service("relationshipService", ['$http', '$q', 'ENV', function($http, $q, ENV) {
    
    var service = {};
    
    /**
         * Get one relationships for a project
         * @returns {*}
         */
    service.getProjectRelationship = function(projectId, relationshipId) {
        
        var deferred = $q.defer();

        $http.get(ENV.apiCKANRoot + '/cadasta_get_project_relationship_details?returnGeometry=true&project_id=' + projectId + '&relationship_id=' + relationshipId, {
            cache: false
        }).
        then(function(response) {
            if (response.data && response.data.error) {
                deferred.reject(response.data.error);
            }
            deferred.resolve(response.data.result.features[0]);
        }
        , function(response) {
            deferred.reject(response);
        }
        );
        
        return deferred.promise;
    }
    ;
    
    /**
         * Get all relationships for a project
         * @returns {*}
         */
    service.getProjectRelationshipsList = function(projectId) {
        
        var deferred = $q.defer();
        
        $http.get(ENV.apiCKANRoot + '/cadasta_get_project_relationship_list?project_id=' + projectId, {
            cache: false
        }).
        then(function(response) {
            if (response.data && response.data.error) {
                deferred.reject(response.data.error);
            }
            deferred.resolve(response.data.result.features);
        }
        , function(response) {
            deferred.reject(response);
        }
        );
        
        return deferred.promise;
    }
    ;
    
    
    /**
         * Get all resources associated with a relationship
         * @returns {*}
         *
         */
    service.getProjectRelationshipResources = function(projectId, relationshipId) {
        
        var deferred = $q.defer();
        
        $http.get(ENV.apiCKANRoot + '/cadasta_get_project_relationship_resources?project_id=' + projectId + '&relationship_id=' + relationshipId, {
            cache: false
        })
        .then(function(response) {
            if (response.data && response.data.error) {
                deferred.reject(response.data.error);
            }
            deferred.resolve(response.data.result.features);
        }
        , function(response) {
            deferred.reject(response);
        }
        );
        
        return deferred.promise;
    }
    ;
    
    
    /**
         * Create a new relationship
         * @returns {*}
         *
         */
    service.createProjectRelationship = function(projectId, parcelId, layer, relationship) {
        
        var deferred = $q.defer();
        
        var acquired_date = null ;
        var how_acquired = null ;
        var description = null ;
        var geom = null ;
        var parcel_id = parseInt(parcelId);
        
        
        if (relationship.acquisition_date) {
            acquired_date = relationship.acquisition_date;
        }
        if (relationship.how_acquired) {
            how_acquired = relationship.how_acquired;
        }
        if (relationship.description) {
            description = relationship.description;
        }
        if (layer) {
            geom = layer;
        }
        
        
        $http({
            method: "post",
            url: ENV.apiCKANRoot + '/cadasta_create_project_relationship',
            data: JSON.stringify({
                project_id: projectId,
                // used for CKAN proxy
                parcel_id: parcel_id,
                ckan_user_id: null ,
                party_id: relationship.party.id,
                geojson: geom,
                tenure_type: relationship.tenure_type,
                acquired_date: acquired_date,
                how_acquired: how_acquired,
                description: description
            }),
            headers: {
                'Content-type': 'application/json'
            }
        }).then(function(response) {
            if (response.data && response.data.error) {
                deferred.reject(response.data.error);
            }
            deferred.resolve(response.data.result);
        }
        , function(response) {
            deferred.reject(response);
        }
        );
        
        return deferred.promise;
    }
    ;
    
    
    
    /**
         * Updates a relationship via a patch request
         * @returns {*}
         * todo pass in a project and parcel id
         */
    service.updateProjectRelationship = function(projectId, relationshipId, layer, relationship) {
        
        var deferred = $q.defer();
        
        var acquired_date = null ;
        var how_acquired = null ;
        var description = null ;
        var geom = null ;
        
        if (relationship.acquired_date) {
            acquired_date = relationship.acquired_date;
        }
        if (relationship.tenure_type) {
            tenure_type = relationship.tenure_type;
        }
        if (relationship.description) {
            description = relationship.description;
        }
        if (relationship.how_acquired) {
            how_acquired = relationship.how_acquired;
        }
        if (layer) {
            geom = layer.geometry;
        }
        
        
        $http({
            method: "post",
            url: ENV.apiCKANRoot + '/cadasta_update_project_relationship',
            data: JSON.stringify({
                project_id: projectId,
                // used in CKAN proxy
                relationship_id: relationshipId,
                // used in CKAN proxy
                geojson: geom,
                tenure_type: relationship.tenure_type,
                acquired_date: acquired_date,
                how_acquired: how_acquired,
                description: description
            }),
            headers: {
                'Content-type': 'application/json'
            }
        }).then(function(response) {
            if (response.data && response.data.error) {
                deferred.reject(response.data.error);
            }
            deferred.resolve(response.data.result);
        }
        , function(response) {
            deferred.reject(response);
        }
        );
        
        return deferred.promise;
    }
    ;
    
    
    
    return service;
}
]);
