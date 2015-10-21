'''This module monkey patches functions in ckan/authz.py and replaces the
default roles with custom roles and decorates
has_user_permission_for_group_org_org to allow a CadastaAdmin to admin groups,
CadastaAdmins can manage all organizations/groups, but have no other sysadmin
powers
'''
from ckan import authz, model
from ckan.common import OrderedDict
from ckan.plugins import toolkit
from ckanext.cadastaroles.model import CadastaAdmin


authz.ROLE_PERMISSIONS = OrderedDict([
    ('admin', ['admin']),
    ('editor', ['read',
                'delete_dataset',
                'create_dataset',
                'update_dataset',
                # cadasta resources
                'upload_project_resource',
                'delete_project_resource',
                'archive_project_resource',
                # parcel
                'read_parcel',
                'create_parcel',
                'update_parcel',
                'delete_parcel',
                'create_parcel_relationship',
                # parcel resources
                'upload_parcel_resource',
                'delete_parcel_resource',
                'archive_parcel_resource',
                # party
                'read_party',
                'create_party',
                'update_party',
                'delete_party',
                'create_parcel_relationship',
                # party resources
                'upload_party_resource',
                'delete_party_resource',
                'archive_party_resource',
                'create_parcel_relationship',
                # relationship
                'read_relationship',
                'create_relationship',
                'update_relationship',
                'delete_relationship',
                ]),
    ('surveyor', ['read',
                  # project resource
                  'upload_project_resource',

                  # parcel
                  'read_parcel',
                  # parcel resource
                  'upload_parcel_resource',
                  'delete_parcel_resource',

                  # party
                  'read_party',
                  # parcel resource
                  'read_party_resource',
                  'read_party_resource',
                  ]),
])


def _trans_role_surveyor():
    return toolkit._('ParaSurveyor')


authz._trans_role_surveyor = _trans_role_surveyor


def is_cadasta_admin_decorator(method):
    def decorate_has_user_permission_for_group_or_org(group_id, user_name,
                                                      permission):
        user_id = authz.get_user_id_for_username(user_name, allow_none=True)
        if not user_id:
            return False
        if CadastaAdmin.is_user_cadasta_admin(model.Session, user_id):
            return True
        return method(group_id, user_name, permission)
    return decorate_has_user_permission_for_group_or_org


authz.has_user_permission_for_group_or_org = is_cadasta_admin_decorator(
    authz.has_user_permission_for_group_or_org)
