from ckan.plugins import toolkit


not_missing = toolkit.get_validator('not_missing')
user_exists = toolkit.get_validator('user_id_or_name_exists')
ignore_missing = toolkit.get_validator('ignore_missing')
int_validator = toolkit.get_validator('int_validator')
boolean_validator = toolkit.get_validator('boolean_validator')
as_org_id = toolkit.get_validator(
    'convert_group_name_or_id_to_id')
as_user_id = toolkit.get_validator(
    'convert_user_name_or_id_to_id')


def org_id_or_name_exists(reference, context):
    model = context['model']
    result = model.Group.get(reference)
    if not result or result.type != 'organization':
        raise toolkit.Invalid(toolkit._(
            'That organization name or ID does not exist.'))
    return reference


def user_role_show():
    return {
        'organization_id': [ignore_missing, unicode, org_id_or_name_exists,
                            as_org_id],
    }


def cadasta_admin_schema():
    return {
        'username': [not_missing, unicode, user_exists],
    }