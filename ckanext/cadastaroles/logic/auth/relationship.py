from ckan import authz, logic
from ckan.logic import auth


def cadasta_show_relationships(context, data_dict):
    return {'success': True}
    # user = context.get('user')
    # package = logic.auth.get_package_object(context,
    #                                         {'id': data_dict['parcel_id']})
    # if package.owner_org:
    #     can_read_relationships = authz.has_user_permission_for_group_or_org(
    #         package.owner_org,
    #         user,
    #         'read_relationship'
    #     )
    #     if can_read_relationships:
    #         return {'success': True}
    # return {'success': False}
