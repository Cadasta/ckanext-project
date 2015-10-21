from ckan.logic import validate
from ckan.plugins import toolkit
from ckanext.cadastaroles.logic import schema
from ckanext.cadastaroles.logic.action.util import cadasta_get_api


@toolkit.side_effect_free
@validate(schema.cadasta_show_relationship_schema)
def cadasta_show_relationship(context, data_dict):
    '''Make api call to cadasta api show relationships

    :param fields: Options: id, spatial_source, user_id, time_created,
        time_updated
    :type fields: str
    :param sort_dir: optional (ASC or DESC)
    :type fields: str
    :param limit: number of records to return
    :type limit: int
    :param returnGeometry: whether to return geometry (optional,
        default: false)
    :type returnGeometry: boolean

    :rtype: dict
    '''
    relationship_id = data_dict.get('id')
    if relationship_id:
        result = cadasta_get_api('relationships/{0}'.format(relationship_id),
                                 **data_dict)
    else:
        result = cadasta_get_api('relationships', data_dict)
    toolkit.check_access('cadasta_show_relationships', context, data_dict)
    return result
