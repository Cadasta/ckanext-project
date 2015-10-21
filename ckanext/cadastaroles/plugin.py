from ckan import plugins
from ckan.config.routing import SubMapper
from ckan.plugins import toolkit
from ckanext.cadastaroles.logic import action, auth
from ckanext.cadastaroles import model
from ckanext.cadastaroles.logic.action.api import (
    get_actions, post_actions, post_files_actions
)


class CadastarolesPlugin(plugins.SingletonPlugin):
    plugins.implements(plugins.IActions)
    plugins.implements(plugins.IAuthFunctions)
    plugins.implements(plugins.IConfigurable)
    plugins.implements(plugins.IConfigurer)
    plugins.implements(plugins.IRoutes, inherit=True)
    plugins.implements(plugins.IPackageController, inherit=True)

    # IActions
    def get_actions(self):
        actions = dict((name, function) for name, function
                       in action.__dict__.items()
                       if callable(function))
        actions.update(get_actions())
        actions.update(post_actions())
        actions.update(post_files_actions())
        return actions

    # IAuthFunctions
    def get_auth_functions(self):
        return dict((name, function) for name, function
                    in auth.__dict__.items()
                    if callable(function))

    # IConfigurer
    def update_config(self, config_):
        toolkit.add_template_directory(config_, 'templates')
        toolkit.add_public_directory(config_, 'public')
        toolkit.add_resource('fanstatic', 'cadastaroles')
        toolkit.add_ckan_admin_tab(config_, 'cadasta_admins', 'Cadasta Admins')

    # IConfigurable
    def configure(self, config):
        model.setup()

    # IRoutes
    def before_map(self, map):
        controller = 'ckanext.cadastaroles.controller:CadastaAdminController'
        with SubMapper(map, controller=controller) as m:
            m.connect('cadasta_admins', '/ckan-admin/cadasta_admins',
                      action='manage', ckan_icon='user')
            m.connect('cadasta_admin_remove',
                      '/ckan-admin/cadasta_admin_remove',
                      action='remove')
        return map
