angular.module('app.filters', [])

    // replace null with '-' for table
    .filter('emptyString', function () {
        return function (input) {
            return input == null ? '-' : input;
        }
    })
    .
    filter('capitalize', function() {
        return function(input, all) {
            var reg = (all) ? /([^\W_]+[^\s-]*) */g : /([^\W_]+[^\s-]*)/;
            return (!!input) ? input.replace(reg, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
        }
    })

    .filter('resourceType', function () {
        return function (inputs, filter_type) {
            var output = [];
            switch (filter_type) {
                case 'project':
                case 'parcel':
                case 'party':
                case 'relationship':
                    //check if array contains filter selection
                    inputs.forEach(function (input) {
                        if (filter_type.indexOf(input.properties.type) !== -1)
                            output.push(input);
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
                case 'id':
                    // sort by ASC
                    var arr = inputs.slice();
                    arr.sort(function (a, b) {
                        return a.properties.description - b.properties.description;
                    });
                    return arr;
                    break;
                default:
                    return inputs;
            }
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

                case 'group':
                case 'individual':
                    //check if array contains filter selection
                    inputs.forEach(function (input, i) {
                        if (input.properties.type.indexOf(filter_type) !== -1) {
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
                    arr.sort(function (a, b) {
                        var a_date = new Date(a.properties.acquired_date);
                        var b_date = new Date(b.properties.acquired_date);
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

                case 'first_name':
                    var arr = inputs.slice();
                    // sort by DESC
                    arr.sort(function (a, b) {
                        return b.properties[filter_type].toLowerCase() >= a.properties[filter_type].toLowerCase() ? -1 : 1;
                        ;
                    });
                    return arr;
                    break;

                case 'tenure_type':
                    var arr = inputs.slice();
                    // sort by DESC
                    arr.sort(function (a, b) {
                        return b.properties[filter_type].toLowerCase() >= a.properties[filter_type].toLowerCase() ? -1 : 1;
                        ;
                    });
                    return arr;
                    break;

                case 'type':
                    var arr = inputs.slice();
                    // sort by DESC
                    arr.sort(function (a, b) {
                        return b.properties[filter_type] < a.properties[filter_type] ? -1 : 1;
                        ;
                    });
                    return arr;
                    break;

                case 'party_name':
                    var arr = inputs.slice();
                    // party names, first need to figure out if group or individual
                    arr.sort(function (a, b) {
                        var name1;
                        var name2;

                        if (a.properties.first_name) {
                            name1 = a.properties.first_name
                        }
                        else {
                            name1 = a.properties.group_name
                        }

                        if (b.properties.first_name) {
                            name2 = b.properties.first_name
                        }
                        else {
                            name2 = b.properties.group_name
                        }

                        return name2.toLowerCase() > name1.toLowerCase() ? -1 : 1;
                    });
                    return arr;
                    break;

                default:
                    return inputs;
            }
        };
    });
