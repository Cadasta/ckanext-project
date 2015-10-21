from ckan.logic import validate
from ckan.plugins import toolkit

from ckanext.cadastaroles.logic import schema
from ckanext.cadastaroles.logic.action.util import cadasta_get_api


@toolkit.side_effect_free
@validate(schema.cadasta_get_organization_schema)
def cadasta_get_organization(context, data_dict):
    '''Make api call to cadasta api show relationship

    Fetch one, or all cadast api organizations, you must be a sysadmin to
    perform this request

    :param id: optional, if not provided, fetch all organizations.
    :type id: int
    :param sort_by: optional (ASC or DESC)
    :type sort_by: str
    :param sort_dir: optional (ASC or DESC)
    :type sort_dir: str
    :param limit: number of records to return (optional)
    :type limit: int
    :param returnGeometry: whether to return geometry (optional,
        default: false)
    :type returnGeometry: boolean

    :rtype: dict
    '''
    toolkit.check_access('sysadmin', context, data_dict)
    organization_id = data_dict.get('id')
    if organization_id:
        return cadasta_get_api('organizations/{0}'.format(organization_id),
                               data_dict)
    else:
        return cadasta_get_api('organizations', data_dict)
