module.exports = {

    // Environment targets
    development: {
        apiCadastaRoot: 'http://localhost:3000',
        apiCKANRoot: 'http://localhost:5000/api/3/action'
    },
    ckanLocal_stagingAPI: {
        apiCadastaRoot: 'http://cadasta-testing.spatialdevmo.com:3000',
        apiCKANRoot: 'http://localhost:5000/api/3/action'

    },
    testing: {
        apiCadastaRoot: 'http://cadasta-testing.spatialdevmo.com:3000',
        apiCKANRoot: 'http://cadasta-testing.spatialdevmo.com/api/3/action'
    },
    staging: {
        apiCadastaRoot: 'http://cadasta-staging.spatialdevmo.com:3000',
        apiCKANRoot: 'http://cadasta-staging.spatialdevmo.com/api/3/action'
    },
    demo: {
        apiCadastaRoot: 'http://cadasta-demo.spatialdevmo.com:3000',
        apiCKANRoot: 'http://cadasta-demo.spatialdevmo.com/api/3/action'
    }
};
