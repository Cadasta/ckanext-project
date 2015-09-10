import ckan.plugins.toolkit as toolkit
import ckan.model as model

from ckanext.project.model import projectAdmin

import logging
log = logging.getLogger(__name__)


def _is_project_admin(context):
    '''
    Determines whether user in context is in the project admin list.
    '''
    user = context.get('user', '')
    userobj = model.User.get(user)
    return projectAdmin.is_user_project_admin(userobj)


def create(context, data_dict):
    '''Create a project.

       Only sysadmin or users listed as project Admins can create a project.
    '''
    return {'success': _is_project_admin(context)}


def delete(context, data_dict):
    '''Delete a project.

       Only sysadmin or users listed as project Admins can delete a project.
    '''
    return {'success': _is_project_admin(context)}


def update(context, data_dict):
    '''Update a project.

       Only sysadmin or users listed as project Admins can update a project.
    '''
    return {'success': _is_project_admin(context)}


@toolkit.auth_allow_anonymous_access
def show(context, data_dict):
    '''All users can access a project show'''
    return {'success': True}


@toolkit.auth_allow_anonymous_access
def list(context, data_dict):
    '''All users can access a project list'''
    return {'success': True}


def package_association_create(context, data_dict):
    '''Create a package project association.

       Only sysadmins or user listed as project Admins can create a
       package/project association.
    '''
    return {'success': _is_project_admin(context)}


def package_association_delete(context, data_dict):
    '''Delete a package project association.

       Only sysadmins or user listed as project Admins can delete a
       package/project association.
    '''
    return {'success': _is_project_admin(context)}


@toolkit.auth_allow_anonymous_access
def project_package_list(context, data_dict):
    '''All users can access a project's package list'''
    return {'success': True}


@toolkit.auth_allow_anonymous_access
def package_project_list(context, data_dict):
    '''All users can access a packages's project list'''
    return {'success': True}


def add_project_admin(context, data_dict):
    '''Only sysadmins can add users to project admin list.'''
    return {'success': False}


def remove_project_admin(context, data_dict):
    '''Only sysadmins can remove users from project admin list.'''
    return {'success': False}


def project_admin_list(context, data_dict):
    '''Only sysadmins can list project admin users.'''
    return {'success': False}
