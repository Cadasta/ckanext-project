from ckan import model
from ckan.lib import helpers
from ckan.plugins import toolkit


class CadastaAdminController(toolkit.BaseController):
    def manage(self):
        context = {'model': model, 'session': model.Session,
                   'user': toolkit.c.user or toolkit.c.author}
        try:
            toolkit.check_access('sysadmin', context, {})
        except toolkit.NotAuthorized:
            toolkit.abort(401, toolkit._('User not authorized to view page'))

        controller = 'ckanext.cadastaroles.controller:CadastaAdminController'
        username = toolkit.request.params.get('username')
        if toolkit.request.method == 'POST' and username:
            try:
                toolkit.get_action('cadasta_admin_create')(
                    data_dict={'username': username}
                )
            except toolkit.NotAuthorized:
                toolkit.abort(401,
                              toolkit._('Unauthorized to perform that action'))
            except toolkit.ObjectNotFound:
                helpers.flash_error(
                    toolkit._("User '{0}' not found.").format(username))
            except toolkit.ValidationError as e:
                helpers.flash_notice(e.error_summary)
            else:
                helpers.flash_success(
                    toolkit._('The user is now a Cadasta Admin'))

            return toolkit.redirect_to(toolkit.url_for(controller=controller,
                                                       action='manage'))

        cadasta_admin_list = toolkit.get_action('cadasta_admin_list')()
        return toolkit.render(
            'admin/manage_cadasta_admin.html',
            extra_vars={
                'cadasta_admin_list': cadasta_admin_list,
            }
        )

    def remove(self):
        context = {'model': model, 'session': model.Session,
                   'user': toolkit.c.user or toolkit.c.author}

        controller = 'ckanext.cadastaroles.controller:CadastaAdminController'
        try:
            toolkit.check_access('sysadmin', context, {})
        except toolkit.NotAuthorized:
            toolkit.abort(401,
                          toolkit._('User not authorized to view page'))

        if 'cancel' in toolkit.request.params:
            toolkit.redirect_to(controller=controller, action='manage')

        user_id = toolkit.request.params['user']
        if toolkit.request.method == 'POST' and user_id:
            try:
                toolkit.get_action('cadasta_admin_delete')(
                    data_dict={'username': user_id})
            except toolkit.NotAuthorized:
                toolkit.abort(401,
                              toolkit._('Unauthorized to perform that action'))
            except toolkit.ObjectNotFound:
                helpers.flash_error(
                    toolkit._('The user is not a Cadasta Admin'))
            else:
                helpers.flash_success(
                    toolkit._('The user is no longer a Cadasta Admin'))

            return toolkit.redirect_to(
                helpers.url_for(controller=controller, action='manage'))

        user_dict = toolkit.get_action('user_show')(data_dict={'id': user_id})
        return toolkit.render(
            'admin/confirm_remove_cadasta_admin.html',
            extra_vars={
                'user_dict': user_dict,
            }
        )
