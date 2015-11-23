from functools import partial
from ckan.plugins import toolkit
from .project import has_permission_for_project

#
#  GET
#
#@toolkit.auth_allow_anonymous_access
def cadasta_get_project_fielddata_responses(context, data_dict):
    data_dict.update({'id':data_dict['project_id']})
    return {
        'success': toolkit.check_access('package_show', context, data_dict)
    }

#@toolkit.auth_allow_anonymous_access
def cadasta_get_project_fielddata(context, data_dict):
    data_dict.update({'id':data_dict['project_id']})
    return {
        'success': toolkit.check_access('package_show', context, data_dict)
    }

#
# CREATE AND UPDATE
#
cadasta_update_project_fielddata_respondents = partial(
    has_permission_for_project,
    permission='update_field_data_respondents',
    project_id_parameter='project_id'
)
cadasta_upload_ona_form = partial(
    has_permission_for_project,
    permission='upload_ona_form',
    project_id_parameter='project_id'
)
