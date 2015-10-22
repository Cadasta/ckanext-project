from ckan.lib.dictization.model_dictize import member_dictize
from ckan.logic import validate
from ckan.plugins import toolkit

from ckanext.cadastaroles.logic import schema


@validate(schema.user_role_show)
@toolkit.side_effect_free
def user_role_show(context, data_dict):
    model = context['model']
    session = context['session']
    user = model.User.get(context['user'])

    members = session.query(model.Member)\
        .filter(model.Member.table_name == 'user')\
        .filter(model.Member.table_id == user.id)\
        .filter(model.Member.state == 'active')

    organization_id = data_dict.get('organization_id')
    if organization_id:
        members = members.filter(model.Member.group_id == organization_id)
    result = []
    for member in members:
        membership = {
            'role': member.capacity,
            'organization': toolkit.get_action('organization_show')(data_dict={
                'include_datasets': True,
                'include_tags': data_dict.get('include_tags', False),
                'include_users': data_dict.get('include_users', False),
                'include_groups': data_dict.get('include_groups', False),
                'include_followers': data_dict.get('include_followers', False),
                'id': member.group_id})
        }

        result.append(membership)
    return result
