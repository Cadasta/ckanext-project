from ckan.lib.dictization.model_dictize import member_dictize
from ckan.logic import validate
from ckan.plugins import toolkit

from ckanext.cadastaroles.logic import schema


@toolkit.side_effect_free
@validate(schema.user_role_show)
def user_role_show(context, data_dict):
    model = context['model']
    session = context['session']
    user_id = data_dict['user_id']
    organization_id = data_dict['organization_id']

    user = model.User.get(user_id)
    organization = model.Group.get(organization_id)

    member = session.query(model.Member)\
        .filter(model.Member.table_name == 'user')\
        .filter(model.Member.table_id == user.id)\
        .filter(model.Member.group_id == organization.id)\
        .filter(model.Member.state == 'active').first()
    if member:
        member_dict = member_dictize(member, context)
        member_dict['role'] = member_dict.pop('capacity')
        member_dict['organization_id'] = member_dict.pop('group_id')
        member_dict['user_id'] = member_dict.pop('table_id')
        member_dict.pop('table_name')
        return member_dict
