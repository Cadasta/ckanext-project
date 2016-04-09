import logging

from routes.mapper import SubMapper

from ckan import plugins
from ckan.plugins import toolkit

from ckanext.project.logic import schema as project_schema
from ckanext.project.model import setup as model_setup
from ckanext.project.logic import action



log = logging.getLogger(__name__)

DATASET_TYPE_NAME = 'project'


class projectPlugin(plugins.SingletonPlugin, toolkit.DefaultDatasetForm):
    plugins.implements(plugins.IConfigurable)
    plugins.implements(plugins.IConfigurer)
    plugins.implements(plugins.IDatasetForm)
    plugins.implements(plugins.IRoutes, inherit=True)
    plugins.implements(plugins.IAuthFunctions)
    plugins.implements(plugins.IActions)
    plugins.implements(plugins.IPackageController)

    # IConfigurer
    def update_config(self, config):
        toolkit.add_template_directory(config, '../templates')
        toolkit.add_public_directory(config, '../public')
        toolkit.add_resource('../fanstatic', 'project')

    # IConfigurable
    def configure(self, config):
        model_setup()

    # IDatasetForm
    def package_types(self):
        return [DATASET_TYPE_NAME]

    def is_fallback(self):
        return True

    def search_template(self):
        return 'project/search.html'

    def new_template(self):
        return 'project/new.html'

    def read_template(self):
        return 'project/read.html'

#    def edit_template(self):
#        return 'project/edit.html'

    def resource_form(self):
        return 'project/snippets/resource_form.html'

    def package_form(self):
        return 'project/new_package_form.html'

    def create_package_schema(self):
        return project_schema.project_create_schema()

    def update_package_schema(self):
        return project_schema.project_update_schema()

    def show_package_schema(self):
        return project_schema.project_show_schema()

    # IRoutes
    def before_map(self, map):

        # rerouting existing CKAN routes
        map.redirect('/projects', '/project')
        map.redirect('/projects/{url:.*}', '/project/{url}')

        map.redirect('/group/{url:.*}', '/organization/{url}',
                     _redirect_code='301 Moved Permanently')
        map.redirect('/group', '/organization',
                     _redirect_code='301 Moved Permanently')
        map.redirect('/groups/{url:.*}', '/organization/{url}',
                     _redirect_code='301 Moved Permanently')
        map.redirect('/groups', '/organization',
                     _redirect_code='301 Moved Permanently')

        map.connect('project_new_resource', '/project/new_resource/{id}',
                    controller='package', action='new_resource')
        map.redirect('/dataset/{url:.*}', '/project/{url}',
                     _redirect_code='301 Moved Permanently')
        map.redirect('/dataset', '/project',
                     _redirect_code='301 Moved Permanently')
        map.redirect('/datasets/{url:.*}', '/project/{url}',
                     _redirect_code='301 Moved Permanently')
        map.redirect('/datasets', '/project',
                     _redirect_code='301 Moved Permanently')
        map.redirect('/projects', '/project',
                      _redirect_code='301 Moved Permanently')
        map.redirect('/tag', '/project',
                      _redirect_code='301 Moved Permanently')
        map.redirect('/stats', '/project',
                      _redirect_code='301 Moved Permanently')
        map.redirect('/revision', '/project',
                      _redirect_code='301 Moved Permanently')

        # remap login function to projects page rather than activity log
        # done for demo 10/14
        map.redirect('/dashboard', '/project')

        with SubMapper(map, controller='ckanext.project.controller:projectController') as m:
            m.connect('project_new', '/project/new', action='new')
            m.connect('project_edit', '/project/edit', action='edit')
            m.connect('project_delete', '/project/delete/{id}', action='delete')

        # add export controller mapping
        with SubMapper(map, controller='ckanext.project.controller:ExportController') as m:
            m.connect('/project/{project_id}/{project_title}/export_parcels', action='dump_parcels')

        return map

    # IAuthFunctions
    def get_auth_functions(self):
        return {}

    # IActions
    def get_actions(self):
        return dict((name, function) for name, function
                    in action.__dict__.items()
                    if callable(function))

    # IPackageController
    def after_delete(self, context, package_dict):
        project_schema.project_archive(package_dict,context)

    def after_search(self, search_results, search_params):
        return search_results

    def after_show(self, context, package_dict):
        pass

    def after_update(self, context, package_dict):
        pass

    def after_create(self, context, package_dict):
        pass

    def before_search(self, search_params):
        return search_params

    def before_view(self, package_dict):
        return package_dict

    def before_index(self,package_dict):
        return package_dict

    def read(self, entity):
        pass

    def create(self, entity):
        pass

    def edit(self, entity):
        pass

    def authz_add_role(self, object_role):
        pass

    def authz_remove_role(self, object_role):
        pass

    def delete(self, entity):
        pass






