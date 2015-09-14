import logging

import ckan.plugins as plugins
import ckan.lib.plugins as lib_plugins
import ckan.lib.helpers as h
from ckan.plugins import toolkit as tk
from ckan.common import OrderedDict
from ckan import model as ckan_model

from routes.mapper import SubMapper

import ckanext.project.logic.auth
import ckanext.project.logic.action.create
import ckanext.project.logic.action.delete
import ckanext.project.logic.action.update
import ckanext.project.logic.action.get
import ckanext.project.logic.schema as project_schema
import ckanext.project.logic.helpers as project_helpers
from ckanext.project.model import setup as model_setup

c = tk.c
_ = tk._

log = logging.getLogger(__name__)

DATASET_TYPE_NAME = 'project'


class projectPlugin(plugins.SingletonPlugin, lib_plugins.DefaultDatasetForm):
    plugins.implements(plugins.IConfigurable)
    plugins.implements(plugins.IConfigurer)
    plugins.implements(plugins.IDatasetForm)
    plugins.implements(plugins.IFacets, inherit=True)
    plugins.implements(plugins.IRoutes, inherit=True)
    plugins.implements(plugins.IAuthFunctions)
    plugins.implements(plugins.IActions)
    plugins.implements(plugins.IPackageController, inherit=True)
    plugins.implements(plugins.ITemplateHelpers)

    # IConfigurer

    def update_config(self, config):
        tk.add_template_directory(config, 'templates')
        tk.add_public_directory(config, 'public')
        tk.add_resource('fanstatic', 'project')
        # If ckan is more than 2.3, use the 2.4+ toolkit method
        if not tk.check_ckan_version(max_version='2.3'):
            tk.add_ckan_admin_tab(config, 'ckanext_project_admins', 'project Config')

    # IConfigurable

    def configure(self, config):
        model_setup()

    # IDatasetForm

    def package_types(self):
        return [DATASET_TYPE_NAME]

    def is_fallback(self):
        return False

    def search_template(self):
        return 'project/search.html'

    def new_template(self):
        return 'project/new.html'

    def read_template(self):
        return 'project/read.html'

    def edit_template(self):
        return 'project/edit.html'

    def package_form(self):
        return 'project/new_package_form.html'

    def create_package_schema(self):
        return project_schema.project_create_schema()

    def update_package_schema(self):
        return project_schema.project_update_schema()

    def show_package_schema(self):
        return project_schema.project_show_schema()

    # ITemplateHelpers

    def get_helpers(self):
        return {
            'facet_remove_field': project_helpers.facet_remove_field,
            'get_site_statistics': project_helpers.get_site_statistics
        }

    # IFacets

    def dataset_facets(self, facets_dict, package_type):
        '''Only show tags for project search list.'''
        if package_type != DATASET_TYPE_NAME:
            return facets_dict
        return OrderedDict({'tags': _('Tags')})

    # IAuthFunctions

    def get_auth_functions(self):
        return {
            'ckanext_project_create': ckanext.project.logic.auth.create,
            'ckanext_project_update': ckanext.project.logic.auth.update,
            'ckanext_project_delete': ckanext.project.logic.auth.delete,
            'ckanext_project_show': ckanext.project.logic.auth.show,
            'ckanext_project_list': ckanext.project.logic.auth.list,
            'ckanext_project_package_association_create': ckanext.project.logic.auth.package_association_create,
            'ckanext_project_package_association_delete': ckanext.project.logic.auth.package_association_delete,
            'ckanext_project_package_list': ckanext.project.logic.auth.project_package_list,
            'ckanext_package_project_list': ckanext.project.logic.auth.package_project_list,
            'ckanext_project_admin_add': ckanext.project.logic.auth.add_project_admin,
            'ckanext_project_admin_remove': ckanext.project.logic.auth.remove_project_admin,
            'ckanext_project_admin_list': ckanext.project.logic.auth.project_admin_list
        }

    # IRoutes

    def before_map(self, map):
        # These named routes are used for custom dataset forms which will use the
        # names below based on the dataset.type ('dataset' is the default type)
        with SubMapper(map, controller='ckanext.project.controller:projectController') as m:
            m.connect('ckanext_project_index', '/project', action='search',
                      highlight_actions='index search')
            m.connect('ckanext_project_new', '/project/new', action='new')
            m.connect('ckanext_project_delete', '/project/delete/{id}', action='delete')
            m.connect('ckanext_project_read', '/project/{id}', action='read',
                      ckan_icon='picture')
            m.connect('ckanext_project_edit', '/project/edit/{id}', action='edit',
                      ckan_icon='edit')
            m.connect('ckanext_project_manage_datasets', '/project/manage_datasets/{id}',
                      action="manage_datasets", ckan_icon="sitemap")
            m.connect('dataset_project_list', '/dataset/projects/{id}',
                      action='dataset_project_list', ckan_icon='picture')
            m.connect('ckanext_project_admins', '/ckan-admin/project_admins',
                      action='manage_project_admins', ckan_icon='picture'),
            m.connect('ckanext_project_admin_remove', '/ckan-admin/project_admin_remove',
                      action='remove_project_admin')

    #rerouting existing CKAN routes
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


      #new_routes

        controller = 'ckanext.project.upload_controller:Upload_Controller'
        parcel_controller = 'ckanext.project.parcel_controller:Parcel_Controller'
        map_controller = 'ckanext.project.map_controller:Map_Controller'
        relationship = 'ckanext.project.relationship_controller:Cadasta_Relationship_Controller'


        #project
        map.connect('project_surveys', '/project/{id}/surveys', controller=controller, action='show_surveys')
        map.connect('project_parcels', '/project/{id}/parcels', controller=parcel_controller, action='read_parcels')
        map.connect('project_resources', '/project/{id}/resources', controller=controller, action='read_resources')
        map.connect('project_activity_stream', '/project/{id}/activity_stream', controller=controller, action='read_activity_stream')
        map.connect('project_survey_template', '/project/{id}/survey_template', controller=controller, action='read_survey_template')
        map.connect('project_form_data_upload', '/project/{id}/form_data_upload', controller=controller, action='form_data_upload')


        #big map
        map.connect('project_map', '/project/{id}/map', controller=map_controller, action='show_map')
        map.connect('edit_project_map', '/project/{id}/edit_map', controller=map_controller, action='edit_map')
        map.connect('show_parcel_map', '/project/{id}/parcel/{parcel_id}/map', controller=map_controller, action='show_parcel_map')
        map.connect('edit_parcel_map', '/project/{id}/edit_parcel/{parcel_id}/map', controller=map_controller, action='edit_parcel_map')
        map.connect('new_parcel_map', '/project/{id}/new/parcel/map', controller=map_controller, action='new_parcel_map')

        map.connect('show_relationship_map', '/project/{id}/parcel/{parcel_id}/relationship/{relationship_id}/map', controller=relationship, action='show_relationship_map')
        map.connect('edit_relationship_map', '/project/{id}/parcel/{parcel_id}/edit_relationship/{relationship_id}/map', controller=relationship, action='edit_relationship_map')
        map.connect('new_relationships_map', '/project/{id}/parcel/{parcel_id}/new/relationship/map', controller=relationship, action='new_relationship_map')



        #parcels
        map.connect('parcel_details', '/project/{id}/parcel/{parcel_id}', controller=parcel_controller, action='read_parcel_details')
        map.connect('edit_parcel_details', '/project/{id}/edit_parcel/{parcel_id}', controller=parcel_controller, action='edit_parcel_details')
        map.connect('new_parcel', '/project/{id}/new/parcel', controller=parcel_controller, action='new_parcel')

        #surveys
        map.connect('survey_details', '/project/{id}/survey/{survey_id}', controller=controller, action='read_survey_details')
        map.connect('edit_survey_details', '/project/{id}/edit_survey/{survey_id}', controller=controller, action='edit_survey_details')

        #relationship
        map.connect('relationship_details', '/project/{id}/parcel/{parcel_id}/relationship/{relationship_id}', controller=relationship, action='read_relationship_details')
        map.connect('edit_relationship_details', '/project/{id}/parcel/{parcel_id}/edit_relationship/{relationship_id}', controller=relationship, action='edit_relationship_details')
        map.connect('new_relationship', '/project/{id}/parcel/{parcel_id}/new/relationship', controller=relationship, action='new_relationship')
        map.connect('relationship_history', '/project/{id}/parcel/{parcel_id}/relationship_history', controller=relationship, action='get_relationship_history')

        #people/parties
        map.connect('party', '/project/{id}/party/{party_id}', controller=controller, action='read_party_details')
        map.connect('edit_party_details', '/project/{id}/edit_party/{party_id}', controller=controller, action='edit_party_details')
        map.connect('new_party', '/project/{id}/new/party', controller=controller, action='new_party')



        return map

    # IActions

    def get_actions(self):
        action_functions = {
            'ckanext_project_create': ckanext.project.logic.action.create.project_create,
            'ckanext_project_update': ckanext.project.logic.action.update.project_update,
            'ckanext_project_delete': ckanext.project.logic.action.delete.project_delete,
            'ckanext_project_show': ckanext.project.logic.action.get.project_show,
            'ckanext_project_list': ckanext.project.logic.action.get.project_list,
            'ckanext_project_package_association_create': ckanext.project.logic.action.create.project_package_association_create,
            'ckanext_project_package_association_delete': ckanext.project.logic.action.delete.project_package_association_delete,
            'ckanext_project_package_list': ckanext.project.logic.action.get.project_package_list,
            'ckanext_package_project_list': ckanext.project.logic.action.get.package_project_list,
            'ckanext_project_admin_add': ckanext.project.logic.action.create.project_admin_add,
            'ckanext_project_admin_remove': ckanext.project.logic.action.delete.project_admin_remove,
            'ckanext_project_admin_list': ckanext.project.logic.action.get.project_admin_list,
        }
        return action_functions

    # IPackageController

    def _add_to_pkg_dict(self, context, pkg_dict):
        '''
        Add key/values to pkg_dict and return it.
        '''

        if pkg_dict['type'] != 'project':
            return pkg_dict

        # Add a display url for the project image to the pkg dict so template
        # has access to it.
        image_url = pkg_dict.get('image_url')
        pkg_dict[u'image_display_url'] = image_url
        if image_url and not image_url.startswith('http'):
            pkg_dict[u'image_url'] = image_url
            pkg_dict[u'image_display_url'] = \
                h.url_for_static('uploads/{0}/{1}'
                                 .format(DATASET_TYPE_NAME, pkg_dict.get('image_url')),
                                 qualified=True)

        # Add dataset count
        pkg_dict[u'num_datasets'] = len(tk.get_action('ckanext_project_package_list')
                                        (context, {'project_id': pkg_dict['id']}))

        # Rendered notes
        pkg_dict[u'project_notes_formatted'] = h.render_markdown(pkg_dict['notes'])
        return pkg_dict

    def after_show(self, context, pkg_dict):
        '''
        Modify package_show pkg_dict.
        '''
        pkg_dict = self._add_to_pkg_dict(context, pkg_dict)

    def before_view(self, pkg_dict):
        '''
        Modify pkg_dict that is sent to templates.
        '''

        context = {'model': ckan_model, 'session': ckan_model.Session,
                   'user': c.user or c.author}

        return self._add_to_pkg_dict(context, pkg_dict)

    def before_search(self, search_params):
        '''
        Unless the query is already being filtered by this dataset_type
        (either positively, or negatively), exclude datasets of type
        `project`.
        '''
        fq = search_params.get('fq', '')
        if 'dataset_type:{0}'.format(DATASET_TYPE_NAME) not in fq:
            fq = "{0} -dataset_type:{1}".format(search_params.get('fq', ''),
                                                DATASET_TYPE_NAME)
            search_params.update({'fq': fq})
        return search_params
