import sqlalchemy

import ckan.plugins.toolkit as toolkit
import ckan.lib.dictization.model_dictize as model_dictize
from ckan.lib.navl.dictization_functions import validate

from ckanext.project.logic.schema import (project_package_list_schema,
                                           package_project_list_schema)
from ckanext.project.model import projectPackageAssociation, projectAdmin

import logging
log = logging.getLogger(__name__)

_select = sqlalchemy.sql.select
_and_ = sqlalchemy.and_


@toolkit.side_effect_free
def project_show(context, data_dict):
    '''Return the pkg_dict for a project (package).

    :param id: the id or name of the project
    :type id: string
    '''

    toolkit.check_access('ckanext_project_show', context, data_dict)

    pkg_dict = toolkit.get_action('package_show')(context, data_dict)

    return pkg_dict


@toolkit.side_effect_free
def project_list(context, data_dict):
    '''Return a list of all projects in the site.'''

    toolkit.check_access('ckanext_project_list', context, data_dict)

    model = context["model"]

    q = model.Session.query(model.Package) \
        .filter(model.Package.type == 'project') \
        .filter(model.Package.state == 'active')

    project_list = []
    for pkg in q.all():
        project_list.append(model_dictize.package_dictize(pkg, context))

    return project_list


@toolkit.side_effect_free
def project_package_list(context, data_dict):
    '''List packages associated with a project.

    :param project_id: id or name of the project
    :type project_id: string

    :rtype: list of dictionaries
    '''

    toolkit.check_access('ckanext_project_package_list', context, data_dict)

    # validate the incoming data_dict
    validated_data_dict, errors = validate(data_dict, project_package_list_schema(), context)

    if errors:
        raise toolkit.ValidationError(errors)

    # get a list of package ids associated with project id
    pkg_id_list = projectPackageAssociation.get_package_ids_for_project(validated_data_dict['project_id'])

    pkg_list = []
    if pkg_id_list is not None:
        # for each package id, get the package dict and append to list if
        # active
        for pkg_id in pkg_id_list:
            pkg = toolkit.get_action('package_show')(context, {'id': pkg_id})
            if pkg['state'] == 'active':
                pkg_list.append(pkg)

    return pkg_list


@toolkit.side_effect_free
def package_project_list(context, data_dict):
    '''List projects associated with a package.

    :param package_id: id or name of the package
    :type package_id: string

    :rtype: list of dictionaries
    '''

    toolkit.check_access('ckanext_package_project_list', context, data_dict)

    # validate the incoming data_dict
    validated_data_dict, errors = validate(data_dict, package_project_list_schema(), context)

    if errors:
        raise toolkit.ValidationError(errors)

    # get a list of project ids associated with the package id
    project_id_list = projectPackageAssociation.get_project_ids_for_package(validated_data_dict['package_id'])

    project_list = []
    if project_id_list is not None:
        for project_id in project_id_list:
            project = toolkit.get_action('package_show')(context, {'id': project_id})
            project_list.append(project)

    return project_list


@toolkit.side_effect_free
def project_admin_list(context, data_dict):
    '''
    Return a list of dicts containing the id and name of all active project
    admin users.

    :rtype: list of dictionaries
    '''

    toolkit.check_access('ckanext_project_admin_list', context, data_dict)

    model = context["model"]

    user_ids = projectAdmin.get_project_admin_ids()

    if user_ids:
        q = model.Session.query(model.User) \
            .filter(model.User.state == 'active') \
            .filter(model.User.id.in_(user_ids))

        project_admin_list = []
        for user in q.all():
            project_admin_list.append({'name': user.name, 'id': user.id})
        return project_admin_list

    return []
