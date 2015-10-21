from ckan.plugins import toolkit
from ckan.logic.auth import get_package_object
from ckan.authz import has_user_permission_for_group_or_org

from functools import partial

_ = toolkit._


def cadasta_create_project(context, data_dict):
    return {
        'success': toolkit.check_access('package_create', context, data_dict={
            'id': data_dict['ckan_id'],
            'owner_org': data_dict['cadasta_organization_id']
        })
    }


def cadasta_update_project(context, data_dict):
    return {
        'success': toolkit.check_access('package_update', context, data_dict={
            'id': data_dict['ckan_id'],
            'owner_org': data_dict['cadasta_organization_id']
        })
    }


def cadasta_delete_project(context, data_dict):
    return {
        'success': toolkit.check_access('package_delete', context, data_dict={
            'id': data_dict['ckan_id'],
            'owner_org': data_dict['cadasta_organization_id']
        })
    }


def cadasta_get_project_overview(context, data_dict):
    return {
        'success': toolkit.check_access('package_show', context, data_dict)
    }


def has_permission_for_project(context, data_dict, permission,
                               project_id_parameter):
    try:
        project = get_package_object(context,
                                     {'id': data_dict[project_id_parameter]})
    except KeyError:
        raise toolkit.ValidationError(
            {project_id_parameter: 'missing parameter'}
        )
    user = context['user']
    if has_user_permission_for_group_or_org(project.owner_org, user,
                                            permission):
        return {'success': True}
    return {
        'success': False,
        'msg': _('User {0} not authorized to {1}').format(
            user, permission.replace('_', ' '))
    }


cadasta_upload_project_resource = partial(
    has_permission_for_project,
    permission='upload_project_resource',
    project_id_parameter='project_id'
)
cadasta_delete_project_resource = partial(
    has_permission_for_project,
    permission='delete_project_resource',
    project_id_parameter='project_id'
)


def cadasta_upload_resource(context, data_dict):
    resource_type = toolkit.get_or_bust(data_dict, 'resource_type')
    if resource_type not in ['parcel', 'party', 'relationship', 'project']:
        raise toolkit.ValidationError(['Not a valid resource_type'])
    permission = 'upload_{0}_resource'.format(resource_type)
    return has_permission_for_project(context, data_dict, permission,
                                      'project_id')
