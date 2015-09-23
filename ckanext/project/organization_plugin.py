from ckan import plugins
from ckan.plugins import toolkit
from ckan.logic.schema import group_form_schema, default_group_schema
from ckan.lib.plugins import DefaultOrganizationForm


ignore_missing = toolkit.get_validator('ignore_missing')
convert_to_extras = toolkit.get_validator('convert_to_extras')
convert_from_extras = toolkit.get_validator('convert_from_extras')


class CadastaOrganization(plugins.SingletonPlugin, DefaultOrganizationForm):
    plugins.implements(plugins.IGroupForm, inherit=False)

    def group_types(self):
        return ('organization', )

    def is_fallback(self):
        return True

    def form_to_db_schema(self, group_type=None):
        schema = group_form_schema()
        schema.update({
            'orgURL': [ignore_missing, unicode, convert_to_extras],
            'contact': [ignore_missing, unicode, convert_to_extras],
        })
        return schema

    def db_to_form_schema(self, group_type=None):
        schema = default_group_schema()
        schema.update({
            'orgURL': [convert_from_extras, ignore_missing, unicode],
            'contact': [convert_from_extras, ignore_missing, unicode],
        })
        return schema
