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
                # resources
                'cadasta_upload_project_resources', # this adds the following 4 resource permissions too
                'upload_project_resource',
                'upload_parcel_resource',
                'upload_party_resource',
                'upload_relationship_resource',
                # parcel
                'read_parcel',
                'create_parcel',
                'update_parcel',
                'delete_parcel',
                'create_parcel_relationship',
                # party
                'read_party',
                'create_party',
                'update_party',
                'delete_party',
                # relationship
                'create_relationship',
                'update_relationship',
                ]),
    ('surveyor', ['read',
                    # resources
                    'cadasta_upload_project_resources', # this adds the following 4 resource permissions too
                    'upload_project_resource',
                    'upload_parcel_resource',
                    'upload_party_resource',
                    'upload_relationship_resource',
                    # parcel
                    'read_parcel',
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

        return method(str(group_id), user_name, permission)
    return decorate_has_user_permission_for_group_or_org


authz.has_user_permission_for_group_or_org = is_cadasta_admin_decorator(
    authz.has_user_permission_for_group_or_org)
