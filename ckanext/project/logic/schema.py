from ckan.plugins import toolkit
from ckan.logic.schema import (
    default_create_package_schema,
    default_show_package_schema,
    default_update_package_schema,
)


convert_to_extras = toolkit.get_validator('convert_to_extras')
convert_from_extras = toolkit.get_validator('convert_from_extras')
ignore_missing = toolkit.get_validator('ignore_missing')


def project_schema():
    return {
        'country': [ignore_missing, unicode, convert_to_extras],
        'province_state': [ignore_missing, unicode, convert_to_extras],
        'district_county': [ignore_missing, unicode, convert_to_extras],
    }


def project_create_schema():
    schema = default_create_package_schema()
    schema.update(project_schema())
    return schema


def project_update_schema():
    schema = default_update_package_schema()
    schema.update(project_schema())
    return schema


def project_show_schema():
    schema = default_show_package_schema()
    schema.update({
        'country': [convert_from_extras, ignore_missing, unicode],
        'province_state': [convert_from_extras, ignore_missing, unicode],
        'district_county': [convert_from_extras, ignore_missing, unicode],
    })

    return schema
