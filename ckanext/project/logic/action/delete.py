from ckan.logic.action.delete import _group_or_org_delete
from ckanext.project.plugin.organization import delete_cadasta_organization
from ckan.plugins import toolkit


def organization_delete(context, data_dict):
    '''Delete an organization.

    You must be authorized to delete the organization.

    :param id: the name or id of the organization
    :type id: string

    '''

    # TODO: validate user for this call

    organization = toolkit.get_action('organization_show')(
        context,
        {'id': data_dict['id']}
    )

    try:
        org_id = int(organization['id'])
    except ValueError:
        raise toolkit.ValidationError([
            'ckan organization id is not an integer {0}'.format(
                organization['id'])]
        )


    request_params = {
        'cadasta_organization_id': org_id,
    }
    request_context = {
        'session': context['session'],
        'user': context['user'],
        'model': context['model']
    }
    delete_cadasta_organization(request_context,request_params)

    return _group_or_org_delete(context, data_dict, is_org=True)