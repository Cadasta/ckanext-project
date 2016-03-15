from ckan.plugins import toolkit
from ckanext.cadastaroles.logic.action.util import (
    cadasta_get_api,
    cadasta_post_api,
    cadasta_patch_api,
    cadasta_post_files_api,
)

from functools import wraps
import string
import re
import json
from pylons import config
import logging
log = logging.getLogger(__name__)


default_converter_types = {
    'limit': int,
    'returnGeometry': bool,
    'project_id': int,
}


class CadastaEndpoint(object):
    def __init__(self, url, argument_types=None, upload_fields=None, keep_param_key=False):
        self.url = url
        self.upload_fields = upload_fields
        self.keep_param_key = keep_param_key
        if argument_types is None:
            self.argument_types = default_converter_types
        else:
            self.argument_types = argument_types

    def convert_argument(self, argument_name, value):
        try:
            if value is None:
                return None
            converter = self.argument_types.get(argument_name, str)
            return converter(value)
        except ValueError:
            return value


def convert_field_storage(value):
    try:
        return { 'file': value.file, 'filename': value.filename }
    except AttributeError:
        raise ValueError('Not a FieldStorage value')


get_api_map = {

    #
    # an example api with auth matching function and tests
    #
    'cadasta_get_project_overview': CadastaEndpoint('/projects/{project_id}/overview'),

    # get params are carried through request
    'cadasta_get_all_projects': CadastaEndpoint('/projects'),

    'cadasta_get_project_resources': CadastaEndpoint('/projects/{project_id}/resources'),

    'cadasta_get_project_activities': CadastaEndpoint('/projects/{project_id}/activity'),

    'cadasta_get_project_mapdata': CadastaEndpoint('/projects/{project_id}/map-data'),

    'cadasta_get_project_parcel_list': CadastaEndpoint('/projects/{project_id}/parcels_list'),

    'cadasta_get_project_parcel': CadastaEndpoint('/projects/{project_id}/parcels/{parcel_id}'),

    'cadasta_get_intersecting_parcels': CadastaEndpoint('/parcels/{project_id}/{parcel_id}/intersects/{buff}',
        argument_types={
            'project_id': int,
            'buff': int,
        }
     ),

    'cadasta_get_parcels_in_bbox': CadastaEndpoint('/parcels/{project_id}/{xmin}/{ymin}/{xmax}/{ymax}',
        argument_types={
            'project_id': int,
            'xmin': float,
            'ymin': float,
            'xmax': float,
            'ymax': float,
        }
     ),

    'cadasta_get_project_parcel_details': CadastaEndpoint('/projects/{project_id}/parcels/{parcel_id}/details'),

    'cadasta_get_project_parcel_relationship_history': CadastaEndpoint('/projects/{project_id}/parcels/{parcel_id}/show_relationship_history'),

    'cadasta_get_project_parcel_resources': CadastaEndpoint('/projects/{project_id}/parcels/{parcel_id}/resources'),

    'cadasta_get_project_details': CadastaEndpoint(
        '/projects/{project_id}',
        argument_types={
            'returnGeometry': str,
        }
    ),

    'cadasta_get_project': CadastaEndpoint(
        '/projects/{project_id}',
        argument_types={
            'returnGeometry': str,
        }
    ),

    'cadasta_get_project_parties': CadastaEndpoint(
        '/projects/{project_id}/parties',
    ),

    'cadasta_get_project_party_details': CadastaEndpoint(
        '/projects/{project_id}/parties/{party_id}/details',
    ),

    'cadasta_get_project_party_resources': CadastaEndpoint(
        '/projects/{project_id}/parties/{party_id}/resources',
    ),

    'cadasta_get_project_relationship_details': CadastaEndpoint(
        '/projects/{project_id}/relationships/{relationship_id}/details',
        argument_types={
            'returnGeometry': str,
        }
    ),

    'cadasta_get_project_relationship_list': CadastaEndpoint(
        '/projects/{project_id}/relationships/relationships_list',
    ),

    'cadasta_get_project_relationship_resources': CadastaEndpoint(
        '/projects/{project_id}/relationships/{relationship_id}/resources',
    ),

    'cadasta_get_project_fielddata_responses': CadastaEndpoint(
        '/projects/{project_id}/fieldData/{field_data_id}/show_responses',
    ),

    'cadasta_get_project_fielddata': CadastaEndpoint(
        '/projects/{project_id}/fieldData',
    ),
}

post_api_map = {
    'cadasta_create_project': CadastaEndpoint(
        '/projects',
        argument_types={
            'cadasta_organization_id': int,
        }
    ),
    'cadasta_create_organization': CadastaEndpoint('/organizations'),
    'cadasta_create_project_parcel': CadastaEndpoint(
        '/projects/{project_id}/parcels',
        argument_types={
            'project_id': int,
            'geojson': dict, # basically, don't stringify it, leave it
        },
        keep_param_key=True
    ),
    'cadasta_create_project_party': CadastaEndpoint(
        '/projects/{project_id}/parties',
    ),
    'cadasta_create_project_relationship': CadastaEndpoint(
        '/projects/{project_id}/relationships',
        argument_types={
            'parcel_id': int,
            'party_id': int,
            'geojson': dict, # basically, don't stringify it, leave it
        },
    ),
}

patch_api_map = {
    'cadasta_update_organization': CadastaEndpoint('/organizations/{cadasta_organization_id}'),
    'cadasta_delete_organization': CadastaEndpoint('/organizations/{cadasta_organization_id}/archive'),
    'cadasta_update_project': CadastaEndpoint(
        '/projects/{cadasta_project_id}',
    ),
    'cadasta_delete_project': CadastaEndpoint('/projects/{cadasta_project_id}/archive'),
    'cadasta_update_project_parcel': CadastaEndpoint(
        '/projects/{project_id}/parcels/{parcel_id}',
        argument_types={
            'geojson': dict, # basically, don't stringify it, leave it
        },
    ),
    'cadasta_update_project_party': CadastaEndpoint(
        '/projects/{project_id}/parties/{party_id}',
    ),
    'cadasta_update_project_relationship': CadastaEndpoint(
        '/projects/{project_id}/relationships/{relationship_id}',
        argument_types={
            'geojson': dict, # basically, don't stringify it, leave it
        },
    ),
    'cadasta_update_project_fielddata_respondents': CadastaEndpoint(
        '/projects/{project_id}/fieldData/{field_data_id}/validate_respondents',
        argument_types={
            'respondent_ids': list, # basically, don't stringify it, leave it,
            'status': int,
        },
    ),
}

post_files_api_map = {
    'cadasta_upload_resource': CadastaEndpoint(
        '/resources/{project_id}/{resource_type}/{resource_type_id}',
        argument_types={'filedata': convert_field_storage},
        upload_fields=['filedata']
    ),
    'cadasta_upload_project_resources': CadastaEndpoint(
        '/projects/{project_id}/{resource_type}/{resource_type_id}/resources',
        argument_types={'filedata': convert_field_storage},
        upload_fields=['filedata']
    ),
    'cadasta_upload_ona_form': CadastaEndpoint(
        '/providers/ona/load-form/{project_id}',
        argument_types={'xls_file': convert_field_storage},
        upload_fields=['xls_file']
    ),
}


def make_cadasta_action(action, cadasta_endpoint, decorator, cadasta_api_func):

    @decorator
    def cadasta_api_action(context, data_dict):
        # we actually always want to call check access
        # development option that should be removed later
        if toolkit.asbool(config.get('ckanext.cadasta.enforce_permissions',
                                     True)):
            toolkit.check_access(action, context, data_dict)

        string_arguments = [a[1] for a in
                            string.Formatter().parse(cadasta_endpoint.url)
                            if a[1]]

        cadasta_dict = {}
        for k, v in data_dict.items():
            cadasta_dict[k] = cadasta_endpoint.convert_argument(k, v)

        error_dict = {}
        endpoint = cadasta_endpoint.url
        for arg in string_arguments:
            if arg not in data_dict.keys() or not data_dict.get(arg):
                error_dict[arg] = ['Missing value']
            else:
                arg_value = ''
                if cadasta_endpoint.keep_param_key is True:
                    arg_value = cadasta_dict.get(arg, '')
                else:
                    arg_value = cadasta_dict.pop(arg, '')
                arg_value = re.sub('[^\-\.0-9a-zA-Z]+', '', str(arg_value))
                endpoint_arg = ''.join(['{', arg, '}'])
                endpoint = endpoint.replace(endpoint_arg, arg_value)
        if error_dict:
            raise toolkit.ValidationError(error_dict)

        return cadasta_api_func(endpoint, cadasta_dict,
                                cadasta_endpoint.upload_fields)

    return cadasta_api_action


def post_request(action):
    '''empty decorator, actions that are side_effect_free=False are POSTS'''
    @wraps(action)
    def wrapper(context, data_dict):
        return action(context, data_dict)
    return wrapper

get_request = toolkit.side_effect_free


def get_actions():
    actions = {}
    for action, cadasta_endpoint in get_api_map.items():
        actions[action] = make_cadasta_action(action, cadasta_endpoint,
                                              get_request,
                                              cadasta_get_api)
    return actions


def post_actions():
    actions = {}
    for action, cadasta_endpoint in post_api_map.items():
        actions[action] = make_cadasta_action(action, cadasta_endpoint,
                                              post_request,
                                              cadasta_post_api)
    return actions

def patch_actions():
    actions = {}
    for action, cadasta_endpoint in patch_api_map.items():
        actions[action] = make_cadasta_action(action, cadasta_endpoint,
                                              post_request,
                                              cadasta_patch_api)
    return actions

def post_files_actions():
    actions = {}
    for action, cadasta_endpoint in post_files_api_map.items():
        actions[action] = make_cadasta_action(action, cadasta_endpoint,
                                              post_request,
                                              cadasta_post_files_api)
    return actions
