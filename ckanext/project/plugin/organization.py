from ckan import plugins
from ckan.plugins import toolkit
from ckan.logic.schema import group_form_schema, default_group_schema
from ckanext.project.logic import schema as project_schema
from ckan.lib.plugins import DefaultOrganizationForm
from ckanext.project.logic.helpers import organization_get_project_count_helper

from ckanext.project.logic.validators import (
    if_empty_generate_uuid,
    organization_name_validator,
    slugify_title_to_name,
)

import json
import logging


log = logging.getLogger(__name__)

ignore_missing = toolkit.get_validator('ignore_missing')
not_missing = toolkit.get_validator('not_missing')
not_empty = toolkit.get_validator('not_empty')
convert_to_extras = toolkit.get_validator('convert_to_extras')
convert_from_extras = toolkit.get_validator('convert_from_extras')


class CadastaOrganization(plugins.SingletonPlugin, DefaultOrganizationForm):

    plugins.implements(plugins.IGroupForm, inherit=False)
    plugins.implements(plugins.ITemplateHelpers)

    # ITemplateHelpers
    def get_helpers(self):
        '''Register the most_popular_groups() function above as a template
        helper function.

        '''
        # Template helper function names should begin with the name of the
        # extension they belong to, to avoid clashing with functions from
        # other extensions.
        return {
            'organization_get_project_count': organization_get_project_count_helper
        }


    def group_types(self):
        return ('organization', )

    def is_fallback(self):
        return True

    def form_to_db_schema(self, group_type=None):
        schema = group_form_schema()
        schema.update({
            'id': [if_empty_generate_uuid],
            'title': [not_empty, unicode],
            'name': [ignore_missing, unicode, slugify_title_to_name,
                     organization_name_validator],
            'orgURL': [ignore_missing, unicode, convert_to_extras],
            'contact': [ignore_missing, unicode, convert_to_extras],
            'ona_api_token': [ignore_missing, unicode, convert_to_extras],
            '__after': [create_cadasta_organization],
        })
        return schema

    def db_to_form_schema(self, group_type=None):
        schema = default_group_schema()
        schema.update({
            'orgURL': [convert_from_extras, ignore_missing, unicode],
            'contact': [convert_from_extras, ignore_missing, unicode],
            'ona_api_token': [convert_from_extras, ignore_missing, unicode],
            'cadasta_id': [convert_from_extras, ignore_missing, unicode],
            'packages': project_schema.project_show_schema()
        })
        return schema


def create_cadasta_organization(key, data, errors, context):
    '''call cadasta_create_organization and save the id returned'''
    # do not make api calls when there are errors
    for error in errors.values():
        if error:
            return
    data_dict = {
        'ckan_id': data['name', ],
        'ckan_name': data['name',],
        'ckan_title': data['title', ],
        'ckan_description': data.get(('description',), '')
    }
    context = {
        'model': context['model'],
        'session': context['session'],
        'user': context['user'],
    }

    try:
        result = toolkit.get_action('cadasta_create_organization')(context,
                                                                   data_dict)
    except KeyError, e:
        log.error('Error calling cadasta api action: {0}').format(e.message)

    try:
        data['id', ] = str(result['cadasta_organization_id'])
        # convert_to_extras(('cadasta_id',), data, errors, context)
    except KeyError:
        error_dict = result.get('error')
        if error_dict:
            error_line = json.dumps(error_dict)
            raise toolkit.ValidationError([
                'error: {0} : {1}\n ckan dict: {2}'.format(
                    result.get('message', ''), error_line,
                    str(data_dict))]
            )
        else:
            raise toolkit.ValidationError(
                ['error: {0} : ckan_dict {1}'.format(
                    result.get('message', ''),
                    str(data_dict))])


