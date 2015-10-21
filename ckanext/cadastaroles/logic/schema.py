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
        'user_id': [not_missing, unicode, user_exists, as_user_id],
        'organization_id': [not_missing, unicode, org_id_or_name_exists,
                            as_org_id],
    }


def cadasta_admin_schema():
    return {
        'username': [not_missing, unicode, user_exists],
    }


def cadasta_show_schema():
    return {
        'id': [not_missing, unicode],
        'fields': [ignore_missing, unicode],
        'sort_by': [ignore_missing, unicode],
        'sort_dir': [ignore_missing, unicode],
        'limit': [ignore_missing, int_validator],
        'returnGeometry': [ignore_missing, boolean_validator],
        'project_id': [ignore_missing, int_validator],
    }


def cadasta_get_parcels_schema():
    return {
        'id': [ignore_missing, unicode],
        'fields': [ignore_missing, unicode],
        'sort_by': [ignore_missing, unicode],
        'sort_dir': [ignore_missing, unicode],
        'limit': [ignore_missing, int_validator],
        'returnGeometry': [ignore_missing, boolean_validator],
        'project_id': [ignore_missing, int_validator],
    }


def cadasta_get_parcel_detail_schema():
    return {
        'id': [not_missing, unicode],
    }


def cadasta_get_parcel_relationship_history_schema():
    return {
        'id': [not_missing, unicode],
        'fields': [ignore_missing, unicode],
        'sort_by': [ignore_missing, unicode],
        'sort_dir': [ignore_missing, unicode],
        'limit': [ignore_missing, int_validator],
    }


def cadasta_get_parcel_resource_schema():
    return {
        'id': [not_missing, unicode],
        'fields': [ignore_missing, unicode],
        'sort_by': [ignore_missing, unicode],
        'sort_dir': [ignore_missing, unicode],
        'limit': [ignore_missing, int_validator],
    }


def cadasta_show_relationship_schema():
    return {
        'fields': [ignore_missing, unicode],
        'sort_by': [ignore_missing, unicode],
        'sort_dir': [ignore_missing, unicode],
        'limit': [ignore_missing, int_validator],
        'returnGeometry': [ignore_missing, boolean_validator],
    }


def cadasta_project_schema():
    return {
        'cadasta_organization_id': [not_missing, int_validator],
        'ckan_id': [not_missing, unicode],
        'ckan_title': [not_missing, unicode]
    }


def cadasta_create_organization_schema():
    return {
        'ckan_id': [not_missing, unicode],
        'ckan_title': [not_missing, unicode],
        'ckan_description': [not_missing, unicode],
    }


def cadasta_get_organization_schema():
    return {
        'id': [ignore_missing, unicode],
        'sort_by': [ignore_missing, unicode],
        'sort_dir': [ignore_missing, unicode],
        'limit': [ignore_missing, int_validator],
        'returnGeometry': [ignore_missing, boolean_validator],
    }
