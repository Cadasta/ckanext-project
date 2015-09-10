import json
from nose import tools as nosetools

import ckan.plugins.toolkit as toolkit
import ckan.tests.factories as factories
import ckan.tests.helpers as helpers


class TestprojectAuthIndex(helpers.FunctionalTestBase):

    def test_auth_anon_user_can_view_project_index(self):
        '''An anon (not logged in) user can view the projects index.'''
        app = self._get_test_app()

        app.get("/project", status=200)

    def test_auth_logged_in_user_can_view_project_index(self):
        '''
        A logged in user can view the project index.
        '''
        app = self._get_test_app()

        user = factories.User()

        app.get("/project", status=200,
                extra_environ={'REMOTE_USER': str(user["name"])})

    def test_auth_anon_user_cant_see_add_project_button(self):
        '''
        An anon (not logged in) user can't see the Add project button on the
        project index page.
        '''
        app = self._get_test_app()

        response = app.get("/project", status=200)

        # test for new project link in response
        response.mustcontain(no="/project/new")

    def test_auth_logged_in_user_cant_see_add_project_button(self):
        '''
        A logged in user can't see the Add project button on the project
        index page.
        '''
        app = self._get_test_app()
        user = factories.User()

        response = app.get("/project", status=200,
                           extra_environ={'REMOTE_USER': str(user['name'])})

        # test for new project link in response
        response.mustcontain(no="/project/new")

    def test_auth_sysadmin_can_see_add_project_button(self):
        '''
        A sysadmin can see the Add project button on the project index
        page.
        '''
        app = self._get_test_app()
        user = factories.Sysadmin()

        response = app.get("/project", status=200,
                           extra_environ={'REMOTE_USER': str(user['name'])})

        # test for new project link in response
        response.mustcontain("/project/new")


class TestprojectAuthDetails(helpers.FunctionalTestBase):
    def test_auth_anon_user_can_view_project_details(self):
        '''
        An anon (not logged in) user can view an individual project details page.
        '''
        app = self._get_test_app()

        factories.Dataset(type='project', name='my-project')

        app.get('/project/my-project', status=200)

    def test_auth_logged_in_user_can_view_project_details(self):
        '''
        A logged in user can view an individual project details page.
        '''
        app = self._get_test_app()
        user = factories.User()

        factories.Dataset(type='project', name='my-project')

        app.get('/project/my-project', status=200,
                extra_environ={'REMOTE_USER': str(user['name'])})

    def test_auth_anon_user_cant_see_manage_button(self):
        '''
        An anon (not logged in) user can't see the Manage button on an individual
        project details page.
        '''
        app = self._get_test_app()

        factories.Dataset(type='project', name='my-project')

        response = app.get('/project/my-project', status=200)

        # test for url to edit page
        response.mustcontain(no="/project/edit/my-project")

    def test_auth_logged_in_user_can_see_manage_button(self):
        '''
        A logged in user can't see the Manage button on an individual project
        details page.
        '''
        app = self._get_test_app()
        user = factories.User()

        factories.Dataset(type='project', name='my-project')

        response = app.get('/project/my-project', status=200,
                           extra_environ={'REMOTE_USER': str(user['name'])})

        # test for url to edit page
        response.mustcontain(no="/project/edit/my-project")

    def test_auth_sysadmin_can_see_manage_button(self):
        '''
        A sysadmin can see the Manage button on an individual project details
        page.
        '''
        app = self._get_test_app()
        user = factories.Sysadmin()

        factories.Dataset(type='project', name='my-project')

        response = app.get('/project/my-project', status=200,
                           extra_environ={'REMOTE_USER': str(user['name'])})

        # test for url to edit page
        response.mustcontain("/project/edit/my-project")

    def test_auth_project_show_anon_can_access(self):
        '''
        Anon user can request project show.
        '''
        app = self._get_test_app()

        factories.Dataset(type='project', name='my-project')

        response = app.get('/api/3/action/ckanext_project_show?id=my-project',
                           status=200)

        json_response = json.loads(response.body)

        nosetools.assert_true(json_response['success'])

    def test_auth_project_show_normal_user_can_access(self):
        '''
        Normal logged in user can request project show.
        '''
        user = factories.User()
        app = self._get_test_app()

        factories.Dataset(type='project', name='my-project')

        response = app.get('/api/3/action/ckanext_project_show?id=my-project',
                           status=200, extra_environ={'REMOTE_USER': str(user['name'])})

        json_response = json.loads(response.body)

        nosetools.assert_true(json_response['success'])

    def test_auth_project_show_sysadmin_can_access(self):
        '''
        Normal logged in user can request project show.
        '''
        user = factories.Sysadmin()
        app = self._get_test_app()

        factories.Dataset(type='project', name='my-project')

        response = app.get('/api/3/action/ckanext_project_show?id=my-project',
                           status=200, extra_environ={'REMOTE_USER': str(user['name'])})

        json_response = json.loads(response.body)

        nosetools.assert_true(json_response['success'])


class TestprojectAuthCreate(helpers.FunctionalTestBase):

    def test_auth_anon_user_cant_view_create_project(self):
        '''
        An anon (not logged in) user can't access the create project page.
        '''
        app = self._get_test_app()
        app.get("/project/new", status=302)

    def test_auth_logged_in_user_cant_view_create_project_page(self):
        '''
        A logged in user can't access the create project page.
        '''
        app = self._get_test_app()
        user = factories.User()
        app.get("/project/new", status=401,
                extra_environ={'REMOTE_USER': str(user['name'])})

    def test_auth_sysadmin_can_view_create_project_page(self):
        '''
        A sysadmin can access the create project page.
        '''
        app = self._get_test_app()
        user = factories.Sysadmin()
        app.get("/project/new", status=200,
                extra_environ={'REMOTE_USER': str(user['name'])})


class TestprojectAuthList(helpers.FunctionalTestBase):

    def test_auth_project_list_anon_can_access(self):
        '''
        Anon user can request project list.
        '''
        app = self._get_test_app()

        factories.Dataset(type='project', name='my-project')

        response = app.get('/api/3/action/ckanext_project_list',
                           status=200)

        json_response = json.loads(response.body)

        nosetools.assert_true(json_response['success'])

    def test_auth_project_list_normal_user_can_access(self):
        '''
        Normal logged in user can request project list.
        '''
        user = factories.User()
        app = self._get_test_app()

        factories.Dataset(type='project', name='my-project')

        response = app.get('/api/3/action/ckanext_project_list',
                           status=200, extra_environ={'REMOTE_USER': str(user['name'])})

        json_response = json.loads(response.body)

        nosetools.assert_true(json_response['success'])

    def test_auth_project_list_sysadmin_can_access(self):
        '''
        Normal logged in user can request project list.
        '''
        user = factories.Sysadmin()
        app = self._get_test_app()

        factories.Dataset(type='project', name='my-project')

        response = app.get('/api/3/action/ckanext_project_list',
                           status=200, extra_environ={'REMOTE_USER': str(user['name'])})

        json_response = json.loads(response.body)

        nosetools.assert_true(json_response['success'])


class TestprojectAuthEdit(helpers.FunctionalTestBase):

    def test_auth_anon_user_cant_view_edit_project_page(self):
        '''
        An anon (not logged in) user can't access the project edit page.
        '''
        app = self._get_test_app()

        factories.Dataset(type='project', name='my-project')

        app.get('/project/edit/my-project', status=302)

    def test_auth_logged_in_user_cant_view_edit_project_page(self):
        '''
        A logged in user can't access the project edit page.
        '''
        app = self._get_test_app()
        user = factories.User()

        factories.Dataset(type='project', name='my-project')

        app.get('/project/edit/my-project', status=401,
                extra_environ={'REMOTE_USER': str(user['name'])})

    def test_auth_sysadmin_can_view_edit_project_page(self):
        '''
        A sysadmin can access the project edit page.
        '''
        app = self._get_test_app()
        user = factories.Sysadmin()

        factories.Dataset(type='project', name='my-project')

        app.get('/project/edit/my-project', status=200,
                extra_environ={'REMOTE_USER': str(user['name'])})

    def test_auth_project_admin_can_view_edit_project_page(self):
        '''
        A project admin can access the project edit page.
        '''
        app = self._get_test_app()
        user = factories.User()

        # Make user a project admin
        helpers.call_action('ckanext_project_admin_add', context={},
                            username=user['name'])

        factories.Dataset(type='project', name='my-project')

        app.get('/project/edit/my-project', status=200,
                extra_environ={'REMOTE_USER': str(user['name'])})

    def test_auth_anon_user_cant_view_manage_datasets(self):
        '''
        An anon (not logged in) user can't access the project manage datasets page.
        '''
        app = self._get_test_app()

        factories.Dataset(type='project', name='my-project')

        app.get('/project/manage_datasets/my-project', status=302)

    def test_auth_logged_in_user_cant_view_manage_datasets(self):
        '''
        A logged in user (not sysadmin) can't access the project manage datasets page.
        '''
        app = self._get_test_app()
        user = factories.User()

        factories.Dataset(type='project', name='my-project')

        app.get('/project/manage_datasets/my-project', status=401,
                extra_environ={'REMOTE_USER': str(user['name'])})

    def test_auth_sysadmin_can_view_manage_datasets(self):
        '''
        A sysadmin can access the project manage datasets page.
        '''
        app = self._get_test_app()
        user = factories.Sysadmin()

        factories.Dataset(type='project', name='my-project')

        app.get('/project/manage_datasets/my-project', status=200,
                extra_environ={'REMOTE_USER': str(user['name'])})

    def test_auth_project_admin_can_view_manage_datasets(self):
        '''
        A project admin can access the project manage datasets page.
        '''
        app = self._get_test_app()
        user = factories.User()

        # Make user a project admin
        helpers.call_action('ckanext_project_admin_add', context={},
                            username=user['name'])

        factories.Dataset(type='project', name='my-project')

        app.get('/project/manage_datasets/my-project', status=200,
                extra_environ={'REMOTE_USER': str(user['name'])})

    def test_auth_anon_user_cant_view_delete_project_page(self):
        '''
        An anon (not logged in) user can't access the project delete page.
        '''
        app = self._get_test_app()

        factories.Dataset(type='project', name='my-project')

        app.get('/project/delete/my-project', status=302)

    def test_auth_logged_in_user_cant_view_delete_project_page(self):
        '''
        A logged in user can't access the project delete page.
        '''
        app = self._get_test_app()
        user = factories.User()

        factories.Dataset(type='project', name='my-project')

        app.get('/project/delete/my-project', status=401,
                extra_environ={'REMOTE_USER': str(user['name'])})

    def test_auth_sysadmin_can_view_delete_project_page(self):
        '''
        A sysadmin can access the project delete page.
        '''
        app = self._get_test_app()
        user = factories.Sysadmin()

        factories.Dataset(type='project', name='my-project')

        app.get('/project/delete/my-project', status=200,
                extra_environ={'REMOTE_USER': str(user['name'])})

    def test_auth_project_admin_can_view_delete_project_page(self):
        '''
        A project admin can access the project delete page.
        '''
        app = self._get_test_app()
        user = factories.User()

        # Make user a project admin
        helpers.call_action('ckanext_project_admin_add', context={},
                            username=user['name'])

        factories.Dataset(type='project', name='my-project')

        app.get('/project/delete/my-project', status=200,
                extra_environ={'REMOTE_USER': str(user['name'])})

    def test_auth_anon_user_cant_view_addtoproject_dropdown_dataset_project_list(self):
        '''
        An anonymous user can't view the 'Add to project' dropdown selector
        from a datasets project list page.
        '''
        app = self._get_test_app()

        factories.Dataset(name='my-project', type='project')
        factories.Dataset(name='my-dataset')

        project_list_response = app.get('/dataset/projects/my-dataset', status=200)

        nosetools.assert_false('project-add' in project_list_response.forms)

    def test_auth_normal_user_cant_view_addtoproject_dropdown_dataset_project_list(self):
        '''
        A normal (logged in) user can't view the 'Add to project' dropdown
        selector from a datasets project list page.
        '''
        user = factories.User()
        app = self._get_test_app()

        factories.Dataset(name='my-project', type='project')
        factories.Dataset(name='my-dataset')

        project_list_response = app.get('/dataset/projects/my-dataset', status=200,
                                         extra_environ={'REMOTE_USER': str(user['name'])})

        nosetools.assert_false('project-add' in project_list_response.forms)

    def test_auth_sysadmin_can_view_addtoproject_dropdown_dataset_project_list(self):
        '''
        A sysadmin can view the 'Add to project' dropdown selector from a
        datasets project list page.
        '''
        user = factories.Sysadmin()
        app = self._get_test_app()

        factories.Dataset(name='my-project', type='project')
        factories.Dataset(name='my-dataset')

        project_list_response = app.get('/dataset/projects/my-dataset', status=200,
                                         extra_environ={'REMOTE_USER': str(user['name'])})

        nosetools.assert_true('project-add' in project_list_response.forms)

    def test_auth_project_admin_can_view_addtoproject_dropdown_dataset_project_list(self):
        '''
        A project admin can view the 'Add to project' dropdown selector from
        a datasets project list page.
        '''
        app = self._get_test_app()
        user = factories.User()

        # Make user a project admin
        helpers.call_action('ckanext_project_admin_add', context={},
                            username=user['name'])

        factories.Dataset(name='my-project', type='project')
        factories.Dataset(name='my-dataset')

        project_list_response = app.get('/dataset/projects/my-dataset', status=200,
                                         extra_environ={'REMOTE_USER': str(user['name'])})

        nosetools.assert_true('project-add' in project_list_response.forms)


class TestprojectPackageAssociationCreate(helpers.FunctionalTestBase):

    def test_project_package_association_create_no_user(self):
        '''
        Calling project package association create with no user raises
        NotAuthorized.
        '''

        context = {'user': None, 'model': None}
        nosetools.assert_raises(toolkit.NotAuthorized, helpers.call_auth,
                                'ckanext_project_package_association_create',
                                context=context)

    def test_project_package_association_create_sysadmin(self):
        '''
        Calling project package association create by a sysadmin doesn't
        raise NotAuthorized.
        '''
        a_sysadmin = factories.Sysadmin()
        context = {'user': a_sysadmin['name'], 'model': None}
        helpers.call_auth('ckanext_project_package_association_create',
                          context=context)

    def test_project_package_association_create_project_admin(self):
        '''
        Calling project package association create by a project admin
        doesn't raise NotAuthorized.
        '''
        project_admin = factories.User()

        # Make user a project admin
        helpers.call_action('ckanext_project_admin_add', context={},
                            username=project_admin['name'])

        context = {'user': project_admin['name'], 'model': None}
        helpers.call_auth('ckanext_project_package_association_create',
                          context=context)

    def test_project_package_association_create_unauthorized_creds(self):
        '''
        Calling project package association create with unauthorized user
        raises NotAuthorized.
        '''
        not_a_sysadmin = factories.User()
        context = {'user': not_a_sysadmin['name'], 'model': None}
        nosetools.assert_raises(toolkit.NotAuthorized, helpers.call_auth,
                                'ckanext_project_package_association_create',
                                context=context)


class TestprojectPackageAssociationDelete(helpers.FunctionalTestBase):

    def test_project_package_association_delete_no_user(self):
        '''
        Calling project package association create with no user raises
        NotAuthorized.
        '''

        context = {'user': None, 'model': None}
        nosetools.assert_raises(toolkit.NotAuthorized, helpers.call_auth,
                                'ckanext_project_package_association_delete',
                                context=context)

    def test_project_package_association_delete_sysadmin(self):
        '''
        Calling project package association create by a sysadmin doesn't
        raise NotAuthorized.
        '''
        a_sysadmin = factories.Sysadmin()
        context = {'user': a_sysadmin['name'], 'model': None}
        helpers.call_auth('ckanext_project_package_association_delete',
                          context=context)

    def test_project_package_association_delete_project_admin(self):
        '''
        Calling project package association create by a project admin
        doesn't raise NotAuthorized.
        '''
        project_admin = factories.User()

        # Make user a project admin
        helpers.call_action('ckanext_project_admin_add', context={},
                            username=project_admin['name'])

        context = {'user': project_admin['name'], 'model': None}
        helpers.call_auth('ckanext_project_package_association_delete',
                          context=context)

    def test_project_package_association_delete_unauthorized_creds(self):
        '''
        Calling project package association create with unauthorized user
        raises NotAuthorized.
        '''
        not_a_sysadmin = factories.User()
        context = {'user': not_a_sysadmin['name'], 'model': None}
        nosetools.assert_raises(toolkit.NotAuthorized, helpers.call_auth,
                                'ckanext_project_package_association_delete',
                                context=context)


class TestprojectAdminAddAuth(helpers.FunctionalTestBase):

    def test_project_admin_add_no_user(self):
        '''
        Calling project admin add with no user raises NotAuthorized.
        '''

        context = {'user': None, 'model': None}
        nosetools.assert_raises(toolkit.NotAuthorized, helpers.call_auth,
                                'ckanext_project_admin_add', context=context)

    def test_project_admin_add_correct_creds(self):
        '''
        Calling project admin add by a sysadmin doesn't raise
        NotAuthorized.
        '''
        a_sysadmin = factories.Sysadmin()
        context = {'user': a_sysadmin['name'], 'model': None}
        helpers.call_auth('ckanext_project_admin_add', context=context)

    def test_project_admin_add_unauthorized_creds(self):
        '''
        Calling project admin add with unauthorized user raises
        NotAuthorized.
        '''
        not_a_sysadmin = factories.User()
        context = {'user': not_a_sysadmin['name'], 'model': None}
        nosetools.assert_raises(toolkit.NotAuthorized, helpers.call_auth,
                                'ckanext_project_admin_add', context=context)


class TestprojectAdminRemoveAuth(helpers.FunctionalTestBase):

    def test_project_admin_remove_no_user(self):
        '''
        Calling project admin remove with no user raises NotAuthorized.
        '''

        context = {'user': None, 'model': None}
        nosetools.assert_raises(toolkit.NotAuthorized, helpers.call_auth,
                                'ckanext_project_admin_remove', context=context)

    def test_project_admin_remove_correct_creds(self):
        '''
        Calling project admin remove by a sysadmin doesn't raise
        NotAuthorized.
        '''
        a_sysadmin = factories.Sysadmin()
        context = {'user': a_sysadmin['name'], 'model': None}
        helpers.call_auth('ckanext_project_admin_remove', context=context)

    def test_project_admin_remove_unauthorized_creds(self):
        '''
        Calling project admin remove with unauthorized user raises
        NotAuthorized.
        '''
        not_a_sysadmin = factories.User()
        context = {'user': not_a_sysadmin['name'], 'model': None}
        nosetools.assert_raises(toolkit.NotAuthorized, helpers.call_auth,
                                'ckanext_project_admin_remove', context=context)


class TestprojectAdminListAuth(helpers.FunctionalTestBase):

    def test_project_admin_list_no_user(self):
        '''
        Calling project admin list with no user raises NotAuthorized.
        '''

        context = {'user': None, 'model': None}
        nosetools.assert_raises(toolkit.NotAuthorized, helpers.call_auth,
                                'ckanext_project_admin_list', context=context)

    def test_project_admin_list_correct_creds(self):
        '''
        Calling project admin list by a sysadmin doesn't raise
        NotAuthorized.
        '''
        a_sysadmin = factories.Sysadmin()
        context = {'user': a_sysadmin['name'], 'model': None}
        helpers.call_auth('ckanext_project_admin_list', context=context)

    def test_project_admin_list_unauthorized_creds(self):
        '''
        Calling project admin list with unauthorized user raises
        NotAuthorized.
        '''
        not_a_sysadmin = factories.User()
        context = {'user': not_a_sysadmin['name'], 'model': None}
        nosetools.assert_raises(toolkit.NotAuthorized, helpers.call_auth,
                                'ckanext_project_admin_list', context=context)


class TestprojectAuthManageprojectAdmins(helpers.FunctionalTestBase):

    def test_auth_anon_user_cant_view_project_admin_manage_page(self):
        '''
        An anon (not logged in) user can't access the manage project admin
        page.
        '''
        app = self._get_test_app()
        app.get("/project/new", status=302)

    def test_auth_logged_in_user_cant_view_project_admin_manage_page(self):
        '''
        A logged in user can't access the manage project admin page.
        '''
        app = self._get_test_app()
        user = factories.User()
        app.get("/project/new", status=401,
                extra_environ={'REMOTE_USER': str(user['name'])})

    def test_auth_sysadmin_can_view_project_admin_manage_page(self):
        '''
        A sysadmin can access the manage project admin page.
        '''
        app = self._get_test_app()
        user = factories.Sysadmin()
        app.get("/project/new", status=200,
                extra_environ={'REMOTE_USER': str(user['name'])})
