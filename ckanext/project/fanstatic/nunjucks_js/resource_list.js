$(document).ready(function() {

    //Hit API and get back response
    var url = "http://54.69.121.180:3000/resources";

    var format_date = function(date) {
        var date_object = new Date(date);
        var month = date_object.getMonth();
        var day = date_object.getDay();
        var year = date_object.getFullYear();
        var date_object_formatted = month + "/" + day + "/" + year;

        return date_object_formatted;
    }

    $.ajax(url).done(function (response) {
        //success
        nunjucks.configure('/nunjucks_snippets', {autoescape: true});

        response.features.forEach(function(resource) {
            resource.properties.time_created = format_date(resource.properties.time_created);
        })

        var res = nunjucks.render('resource_list.html', response);

        $("#nunjuck-resource-list").html(res);
    })
        .fail(function () {
            //err
        })
        .always(function () {
            //no matter what
        });



});
