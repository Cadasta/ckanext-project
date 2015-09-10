import logging

import ckan.lib.uploader as uploader
import ckan.plugins.toolkit as toolkit
from ckan.logic.converters import convert_user_name_or_id_to_id
from ckan.lib.navl.dictization_functions import validate

import ckanext.project.logic.converters as project_converters
import ckanext.project.logic.schema as project_schema
from ckanext.project.model import projectPackageAssociation, projectAdmin

convert_package_name_or_id_to_title_or_name = project_converters.convert_package_name_or_id_to_title_or_name
project_package_association_create_schema = project_schema.project_package_association_create_schema
project_admin_add_schema = project_schema.project_admin_add_schema

log = logging.getLogger(__name__)


def project_create(context, data_dict):
    '''Upload the image and continue with package creation.'''

    # force type to 'project'
    data_dict['type'] = 'project'

    upload = uploader.Upload('project')
    upload.update_data_dict(data_dict, 'image_url',
                            'image_upload', 'clear_upload')

    upload.upload(uploader.get_max_image_size())

    pkg = toolkit.get_action('package_create')(context, data_dict)

    return pkg


def project_package_association_create(context, data_dict):
    '''Create an association between a project and a package.

    :param project_id: id or name of the project to associate
    :type project_id: string

    :param package_id: id or name of the package to associate
    :type package_id: string
    '''

    toolkit.check_access('ckanext_project_package_association_create', context, data_dict)

    # validate the incoming data_dict
    validated_data_dict, errors = validate(data_dict, project_package_association_create_schema(), context)

    if errors:
        raise toolkit.ValidationError(errors)

    package_id, project_id = toolkit.get_or_bust(validated_data_dict, ['package_id', 'project_id'])

    if projectPackageAssociation.exists(package_id=package_id, project_id=project_id):
        raise toolkit.ValidationError("projectPackageAssociation with package_id '{0}' and project_id '{1}' already exists.".format(package_id, project_id),
                                      error_summary=u"The dataset, {0}, is already in the project".format(convert_package_name_or_id_to_title_or_name(package_id, context)))

    # create the association
    return projectPackageAssociation.create(package_id=package_id, project_id=project_id)


def project_admin_add(context, data_dict):
    '''Add a user to the list of project admins.

    :param username: name of the user to add to project user admin list
    :type username: string
    '''

    toolkit.check_access('ckanext_project_admin_add', context, data_dict)

    # validate the incoming data_dict
    validated_data_dict, errors = validate(data_dict, project_admin_add_schema(), context)

    username = toolkit.get_or_bust(validated_data_dict, 'username')
    try:
        user_id = convert_user_name_or_id_to_id(username, context)
    except toolkit.Invalid:
        raise toolkit.ObjectNotFound

    if errors:
        raise toolkit.ValidationError(errors)

    if projectAdmin.exists(user_id=user_id):
        raise toolkit.ValidationError("projectAdmin with user_id '{0}' already exists.".format(user_id),
                                      error_summary=u"User '{0}' is already a project Admin.".format(username))

    # create project admin entry
    return projectAdmin.create(user_id=user_id)
