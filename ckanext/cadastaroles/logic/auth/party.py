from functools import partial
from ckan.plugins import toolkit
from .project import has_permission_for_project

#
#  GET
#
#@toolkit.auth_allow_anonymous_access
def cadasta_get_project_parties(context, data_dict):
    data_dict.update({'id':data_dict['project_id']})
    return {
        'success': toolkit.check_access('package_show', context, data_dict)
    }

#@toolkit.auth_allow_anonymous_access
def cadasta_get_project_party_details(context, data_dict):
    data_dict.update({'id':data_dict['project_id']})
    return {
        'success': toolkit.check_access('package_show', context, data_dict)
    }

#@toolkit.auth_allow_anonymous_access
def cadasta_get_project_party_resources(context, data_dict):
    data_dict.update({'id':data_dict['project_id']})
    return {
        'success': toolkit.check_access('package_show', context, data_dict)
    }


#@toolkit.auth_allow_anonymous_access
def cadasta_get_project_party_resources(context, data_dict):
    data_dict.update({'id':data_dict['project_id']})
    return {
        'success': toolkit.check_access('package_show', context, data_dict)
    }

#
# CREATE AND UPDATE
#
cadasta_create_project_party = partial(
    has_permission_for_project,
    permission='create_party',
    project_id_parameter='project_id'
)

cadasta_update_project_party = partial(
    has_permission_for_project,
    permission='update_party',
    project_id_parameter='project_id'
)