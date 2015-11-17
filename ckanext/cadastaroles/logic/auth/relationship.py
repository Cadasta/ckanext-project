from ckan import authz, logic
from ckan.logic import auth

from functools import partial
from ckan.plugins import toolkit
from .project import has_permission_for_project

#
#  GET
#
@toolkit.auth_allow_anonymous_access
def cadasta_get_project_relationship_details(context, data_dict):
    data_dict.update({'id':data_dict['project_id']})
    return {
        'success': toolkit.check_access('package_show', context, data_dict)
    }

@toolkit.auth_allow_anonymous_access
def cadasta_get_project_relationship_list(context, data_dict):
    data_dict.update({'id':data_dict['project_id']})
    return {
        'success': toolkit.check_access('package_show', context, data_dict)
    }

@toolkit.auth_allow_anonymous_access
def cadasta_get_project_relationship_resources(context, data_dict):
    data_dict.update({'id':data_dict['project_id']})
    return {
        'success': toolkit.check_access('package_show', context, data_dict)
    }

def cadasta_show_relationships(context, data_dict):
    return {'success': True}



#
# CREATE AND UPDATE
#
cadasta_create_project_relationship = partial(
    has_permission_for_project,
    permission='create_relationship',
    project_id_parameter='project_id'
)

cadasta_update_project_relationship = partial(
    has_permission_for_project,
    permission='update_relationship',
    project_id_parameter='project_id'
)