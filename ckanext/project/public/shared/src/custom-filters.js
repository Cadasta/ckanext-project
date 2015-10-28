angular.module('app.filters', [])

    // replace null with '-' for table
    .filter('emptyString', function () {
    return function (input) {
        return input == null ? '-' : input;
    }
    })

    // custom tenure type filter
    .filter('customFilter', function () {
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

            case 'first_name':
                var arr = inputs.slice();
                // sort by DESC
                arr.sort(function(a,b){
                    return b.properties[filter_type].toLowerCase() >= a.properties[filter_type].toLowerCase() ? -1 : 1;;
                });
                return arr;
                break;

            case 'tenure_type':
                var arr = inputs.slice();
                // sort by DESC
                arr.sort(function(a,b){
                    return b.properties[filter_type].toLowerCase() >= a.properties[filter_type].toLowerCase() ? -1 : 1;;
                });
                return arr;
                break;

            default:
                return inputs;
        }
    };
});
