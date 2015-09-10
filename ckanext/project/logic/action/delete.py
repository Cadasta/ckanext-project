import logging

import ckan.plugins.toolkit as toolkit
from ckan.logic.converters import convert_user_name_or_id_to_id
import ckan.lib.navl.dictization_functions

from ckanext.project.logic.schema import project_package_association_delete_schema, project_admin_remove_schema

from ckanext.project.model import projectPackageAssociation, projectAdmin

validate = ckan.lib.navl.dictization_functions.validate

log = logging.getLogger(__name__)


def project_delete(context, data_dict):
    '''Delete a project. project delete cascades to
    projectPackageAssociation objects.

    :param id: the id or name of the project to delete
    :type id: string
    '''

    model = context['model']
    id = toolkit.get_or_bust(data_dict, 'id')

    entity = model.Package.get(id)

    if entity is None:
        raise toolkit.ObjectNotFound

    toolkit.check_access('ckanext_project_delete', context, data_dict)

    entity.purge()
    model.repo.commit()


def project_package_association_delete(context, data_dict):
    '''Delete an association between a project and a package.

    :param project_id: id or name of the project in the association
    :type project_id: string

    :param package_id: id or name of the package in the association
    :type package_id: string
    '''

    model = context['model']

    toolkit.check_access('ckanext_project_package_association_delete', context, data_dict)

    # validate the incoming data_dict
    validated_data_dict, errors = validate(data_dict, project_package_association_delete_schema(), context)

    if errors:
        raise toolkit.ValidationError(errors)

    package_id, project_id = toolkit.get_or_bust(validated_data_dict, ['package_id', 'project_id'])

    project_package_association = projectPackageAssociation.get(package_id=package_id,
                                                                  project_id=project_id)

    if project_package_association is None:
        raise toolkit.ObjectNotFound("projectPackageAssociation with package_id '{0}' and project_id '{1}' doesn't exist.".format(package_id, project_id))

    # delete the association
    project_package_association.delete()
    model.repo.commit()


def project_admin_remove(context, data_dict):
    '''Remove a user to the list of project admins.

    :param username: name of the user to remove from project user admin list
    :type username: string
    '''

    model = context['model']

    toolkit.check_access('ckanext_project_admin_remove', context, data_dict)

    # validate the incoming data_dict
    validated_data_dict, errors = validate(data_dict, project_admin_remove_schema(), context)

    if errors:
        raise toolkit.ValidationError(errors)

    username = toolkit.get_or_bust(validated_data_dict, 'username')
    user_id = convert_user_name_or_id_to_id(username, context)

    project_admin_to_remove = projectAdmin.get(user_id=user_id)

    if project_admin_to_remove is None:
        raise toolkit.ObjectNotFound("projectAdmin with user_id '{0}' doesn't exist.".format(user_id))

    project_admin_to_remove.delete()
    model.repo.commit()
