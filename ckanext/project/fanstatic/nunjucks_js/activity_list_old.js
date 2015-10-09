$(document).ready(function() {

    //Hit API and get back response
    var url = "http://54.69.121.180:3000/show_activity";

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

            response.features.forEach(function(activity) {
                activity.properties.time_created = format_date(activity.properties.time_created);
            })

            var res = nunjucks.render('activity_list.html', response);

             $("#nunjuck-activity-list").html(res);
    })
    .fail(function () {
        //err
    })
    .always(function () {
        //no matter what
    });



})
