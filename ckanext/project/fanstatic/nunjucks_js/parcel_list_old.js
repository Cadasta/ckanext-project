$(document).ready(function() {

        //Given the options, call the API with querystring args
        //Hit API and get back response
        var url = "http://54.69.121.180:3000/show_parcels_list";

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

            var parcels = response.features;

            parcels.forEach(function(parcel) {
                parcel.properties.time_created = format_date(parcel.properties.time_created);
            });

            var res = nunjucks.render('parcel_list.html', response);


             $("#nunjuck-parcel-list").append(res);
    })
    .fail(function () {
        //err
    })
    .always(function () {
        //no matter what
    });

});
