$('#field-title').on('input', function (evt) {
    var current_value = $('#field-title').val();
    var has_bad_chars = /[\s-_]/g.test(current_value);
    if (has_bad_chars) {
        var new_value = current_value.replace(/[\s-_]/, '');
        $('#field-title').val(new_value);

        // give the user notice and remove old notices
        $('#field-title').parent().find('span').remove()
        $('<span/>')
            .addClass('error-block')
            .html('You cannot use whitespaces, underscores or dashes in your title!')
            .insertAfter('#field-title')
            .fadeOut(4000);
    }
});