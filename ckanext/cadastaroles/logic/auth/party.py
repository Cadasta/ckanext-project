from functools import partial
from ckan.plugins import toolkit
from .project import has_permission_for_project

#
#  GET
#
@toolkit.auth_allow_anonymous_access
def cadasta_get_project_parties(context, data_dict):
    data_dict.update({'id':data_dict['project_id']})
    return {
        'success': toolkit.check_access('package_show', context, data_dict)
    }
