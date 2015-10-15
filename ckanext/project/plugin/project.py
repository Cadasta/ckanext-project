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



        # remap login function to projects page rather than activity log
        # done for demo 10/14
        map.redirect('/dashboard', '/project')



        with SubMapper(map, controller='ckanext.project.controller:projectController') as m:
            m.connect('project_new', '/project/new', action='new')
            m.connect('project_edit', '/project/edit', action='edit')
            m.connect('project_delete', '/project/delete/{id}', action='delete')
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

    # IAuthFunctions

    def get_auth_functions(self):
        return {}

    # IActions

    def get_actions(self):
        return dict((name, function) for name, function
                    in action.__dict__.items()
                    if callable(function))
