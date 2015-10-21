from ckan import model
from ckan.plugins import toolkit
from ckan.logic import validate
from ckanext.cadastaroles.model import CadastaAdmin
from ckanext.cadastaroles.logic import schema


@validate(schema.cadasta_admin_schema)
def cadasta_admin_create(context, data_dict):
    '''Make a user a Cadasta admin

    Cadasta admin can administer all organizations.
    You must be a sysadmin to make this api call.

    :param username: the username of the cadasta admin to delete
    :type username: str

    :rtype: bool (success)
    '''
    toolkit.check_access('sysadmin', context, data_dict)
    session = context['session']
    username = data_dict['username']
    user_object = model.User.get(username)
    if CadastaAdmin.exists(session, user_id=user_object.id):
        raise toolkit.ValidationError(
            'user {0} is already a Cadasta admin'.format(username)
        )
    return CadastaAdmin.create(session, user_id=user_object.id)


@validate(schema.cadasta_admin_schema)
def cadasta_admin_delete(context, data_dict):
    '''Delete a cadasta admin

    You must be a sysadmin to make this api call

    :param username: the username of the cadasta admin to delete
    :type username: str

    :rtype: bool (success)
    '''
    toolkit.check_access('sysadmin', context, data_dict)
    session = context['session']
    username = data_dict['username']
    user_object = model.User.get(username)
    admin = CadastaAdmin.get(session, user_id=user_object.id)
    if admin:
        session.delete(admin)
        session.commit()
    else:
        raise toolkit.ValidationError(
            'user {0} is not a Cadasta admin'.format(username)
        )


def cadasta_admin_list(context, data_dict):
    '''Show the list of admins that can administer all organizations

    You must be a sysadmin to make this api call

    :rtype: list of user ids
    '''
    toolkit.check_access('sysadmin', context, data_dict)
    session = context['session']
    user_ids = CadastaAdmin.get_cadasta_admin_ids(session)
    return [toolkit.get_action('user_show')(data_dict={'id': user_id})
            for user_id in user_ids]
