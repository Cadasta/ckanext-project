from routes import url_for
from nose import tools as nosetools

import ckan.model as model
import ckan.tests.helpers as helpers
import ckan.tests.factories as factories

from ckanext.project.model import projectPackageAssociation

import logging
log = logging.getLogger(__name__)

submit_and_follow = helpers.submit_and_follow


class TestprojectIndex(helpers.FunctionalTestBase):

    def test_projects_redirects_to_project(self):
        '''/projects redirects to /project.'''
        app = self._get_test_app()
        response = app.get('/projects', status=302)
        nosetools.assert_equal(response.location, 'http://localhost/project')

    def test_projects_redirects_to_project_for_item(self):
        '''/projects/ redirects to /project.'''
        app = self._get_test_app()

        factories.Dataset(type='project', name='my-project')

        response = app.get('/projects/my-project', status=302)
        nosetools.assert_equal(response.location, 'http://localhost/project/my-project')

    def test_project_listed_on_index(self):
        '''
        An added project will appear on the project index page.
        '''
        app = self._get_test_app()

        factories.Dataset(type='project', name='my-project')

        response = app.get("/project", status=200)
        response.mustcontain("1 project found")
        response.mustcontain("my-project")


class TestprojectNewView(helpers.FunctionalTestBase):

    def test_project_create_form_renders(self):
        app = self._get_test_app()
        sysadmin = factories.Sysadmin()

        env = {'REMOTE_USER': sysadmin['name'].encode('ascii')}
        response = app.get(
            url=url_for(controller='ckanext.project.controller:projectController', action='new'),
            extra_environ=env,
        )
        nosetools.assert_true('dataset-edit' in response.forms)

    def test_project_new_redirects_to_manage_datasets(self):
        '''Creating a new project redirects to the manage datasets form.'''
        app = self._get_test_app()
        sysadmin = factories.Sysadmin()
        # need a dataset for the 'bulk_action.project_add' button to show
        factories.Dataset()

        env = {'REMOTE_USER': sysadmin['name'].encode('ascii')}
        response = app.get(
            url=url_for(controller='ckanext.project.controller:projectController', action='new'),
            extra_environ=env,
        )

        # create project
        form = response.forms['dataset-edit']
        form['name'] = u'my-project'
        create_response = submit_and_follow(app, form, env, 'save')

        # Unique to manage_datasets page
        nosetools.assert_true('bulk_action.project_add' in create_response)
        # Requested page is the manage_datasets url.
        nosetools.assert_equal(url_for(controller='ckanext.project.controller:projectController',
                                       action='manage_datasets', id='my-project'), create_response.request.path)


class TestprojectEditView(helpers.FunctionalTestBase):

    def test_project_edit_form_renders(self):
        '''
        Edit form renders in response for projectController edit action.
        '''
        app = self._get_test_app()
        sysadmin = factories.Sysadmin()
        factories.Dataset(name='my-project', type='project')

        env = {'REMOTE_USER': sysadmin['name'].encode('ascii')}
        response = app.get(
            url=url_for(controller='ckanext.project.controller:projectController',
                        action='edit',
                        id='my-project'),
            extra_environ=env,
        )
        nosetools.assert_true('dataset-edit' in response.forms)

    def test_project_edit_redirects_to_project_details(self):
        '''Editing a project redirects to the project details page.'''
        app = self._get_test_app()
        sysadmin = factories.Sysadmin()
        factories.Dataset(name='my-project', type='project')

        env = {'REMOTE_USER': sysadmin['name'].encode('ascii')}
        response = app.get(
            url=url_for(controller='ckanext.project.controller:projectController',
                        action='edit', id='my-project'),
            extra_environ=env,
        )

        # edit project
        form = response.forms['dataset-edit']
        form['name'] = u'my-changed-project'
        edit_response = submit_and_follow(app, form, env, 'save')

        # Requested page is the project read url.
        nosetools.assert_equal(url_for(controller='ckanext.project.controller:projectController',
                                       action='read', id='my-changed-project'), edit_response.request.path)


class TestDatasetView(helpers.FunctionalTestBase):

    '''Plugin adds a new projects view for datasets.'''

    def test_dataset_read_has_projects_tab(self):
        '''
        Dataset view page has a new projects tab linked to the correct place.
        '''
        app = self._get_test_app()
        dataset = factories.Dataset(name='my-dataset')

        response = app.get(
            url=url_for(controller='package', action='read', id=dataset['id'])
        )
        # response contains link to dataset's project list
        nosetools.assert_true('/dataset/projects/{0}'.format(dataset['name']) in response)

    def test_dataset_project_page_lists_projects_no_associations(self):
        '''
        No projects are listed if dataset has no project associations.
        '''

        app = self._get_test_app()
        dataset = factories.Dataset(name='my-dataset')

        response = app.get(
            url=url_for(controller='ckanext.project.controller:projectController',
                        action='dataset_project_list', id=dataset['id'])
        )

        nosetools.assert_equal(len(response.html.select('ul.media-grid li.media-item')), 0)

    def test_dataset_project_page_lists_projects_two_associations(self):
        '''
        Two projects are listed for dataset with two project associations.
        '''

        app = self._get_test_app()
        sysadmin = factories.Sysadmin()
        dataset = factories.Dataset(name='my-dataset')
        project_one = factories.Dataset(name='my-first-project', type='project')
        project_two = factories.Dataset(name='my-second-project', type='project')
        factories.Dataset(name='my-third-project', type='project')

        context = {'user': sysadmin['name']}
        helpers.call_action('ckanext_project_package_association_create',
                            context=context, package_id=dataset['id'],
                            project_id=project_one['id'])
        helpers.call_action('ckanext_project_package_association_create',
                            context=context, package_id=dataset['id'],
                            project_id=project_two['id'])

        response = app.get(
            url=url_for(controller='ckanext.project.controller:projectController',
                        action='dataset_project_list', id=dataset['id'])
        )

        nosetools.assert_equal(len(response.html.select('li.media-item')), 2)
        nosetools.assert_true('my-first-project' in response)
        nosetools.assert_true('my-second-project' in response)
        nosetools.assert_true('my-third-project' not in response)

    def test_dataset_project_page_add_to_project_dropdown_list(self):
        '''
        Add to project dropdown only lists projects that aren't already
        associated with dataset.
        '''
        app = self._get_test_app()
        sysadmin = factories.Sysadmin()
        dataset = factories.Dataset(name='my-dataset')
        project_one = factories.Dataset(name='my-first-project', type='project')
        project_two = factories.Dataset(name='my-second-project', type='project')
        project_three = factories.Dataset(name='my-third-project', type='project')

        context = {'user': sysadmin['name']}
        helpers.call_action('ckanext_project_package_association_create',
                            context=context, package_id=dataset['id'],
                            project_id=project_one['id'])

        response = app.get(
            url=url_for(controller='ckanext.project.controller:projectController',
                        action='dataset_project_list', id=dataset['id']),
            extra_environ={'REMOTE_USER': str(sysadmin['name'])}
        )

        project_add_form = response.forms['project-add']
        project_added_options = [value for (value, _) in project_add_form['project_added'].options]
        nosetools.assert_true(project_one['id'] not in project_added_options)
        nosetools.assert_true(project_two['id'] in project_added_options)
        nosetools.assert_true(project_three['id'] in project_added_options)

    def test_dataset_project_page_add_to_project_dropdown_submit(self):
        '''
        Submitting 'Add to project' form with selected project value creates
        a sc/pkg association.
        '''
        app = self._get_test_app()
        sysadmin = factories.Sysadmin()
        dataset = factories.Dataset(name='my-dataset')
        project_one = factories.Dataset(name='my-first-project', type='project')
        factories.Dataset(name='my-second-project', type='project')
        factories.Dataset(name='my-third-project', type='project')

        nosetools.assert_equal(model.Session.query(projectPackageAssociation).count(), 0)

        env = {'REMOTE_USER': sysadmin['name'].encode('ascii')}

        response = app.get(
            url=url_for(controller='ckanext.project.controller:projectController',
                        action='dataset_project_list', id=dataset['id']),
            extra_environ=env
        )

        form = response.forms['project-add']
        form['project_added'] = project_one['id']
        project_add_response = submit_and_follow(app, form, env)

        # returns to the correct page
        nosetools.assert_equal(project_add_response.request.path, "/dataset/projects/my-dataset")
        # an association is created
        nosetools.assert_equal(model.Session.query(projectPackageAssociation).count(), 1)

    def test_dataset_project_page_remove_project_button_submit(self):
        '''
        Submitting 'Remove' form with selected project value deletes a sc/pkg
        association.
        '''
        app = self._get_test_app()
        sysadmin = factories.Sysadmin()
        dataset = factories.Dataset(name='my-dataset')
        project_one = factories.Dataset(name='my-first-project', type='project')

        context = {'user': sysadmin['name']}
        helpers.call_action('ckanext_project_package_association_create',
                            context=context, package_id=dataset['id'],
                            project_id=project_one['id'])

        nosetools.assert_equal(model.Session.query(projectPackageAssociation).count(), 1)

        env = {'REMOTE_USER': sysadmin['name'].encode('ascii')}
        response = app.get(
            url=url_for(controller='ckanext.project.controller:projectController',
                        action='dataset_project_list', id=dataset['id']),
            extra_environ=env
        )

        # Submit the remove form.
        form = response.forms[1]
        nosetools.assert_equal(form['remove_project_id'].value, project_one['id'])
        project_remove_response = submit_and_follow(app, form, env)

        # returns to the correct page
        nosetools.assert_equal(project_remove_response.request.path, "/dataset/projects/my-dataset")
        # the association is deleted
        nosetools.assert_equal(model.Session.query(projectPackageAssociation).count(), 0)


class TestprojectAdminManageView(helpers.FunctionalTestBase):

    '''Plugin adds a project admin management page to ckan-admin section.'''

    def test_ckan_admin_has_project_config_tab(self):
        '''
        ckan-admin index page has a project config tab.
        '''

        app = self._get_test_app()
        sysadmin = factories.Sysadmin()

        env = {'REMOTE_USER': sysadmin['name'].encode('ascii')}
        response = app.get(
            url=url_for(controller='admin', action='index'),
            extra_environ=env
        )
        # response contains link to dataset's project list
        nosetools.assert_true('/ckan-admin/project_admins' in response)

    def test_project_admin_manage_page_returns_correct_status(self):
        '''
        /ckan-admin/project_admins can be successfully accessed.
        '''
        app = self._get_test_app()
        sysadmin = factories.Sysadmin()

        env = {'REMOTE_USER': sysadmin['name'].encode('ascii')}
        app.get(url=url_for(controller='ckanext.project.controller:projectController',
                            action='manage_project_admins'),
                status=200, extra_environ=env)

    def test_project_admin_manage_page_lists_project_admins(self):
        '''
        project admins are listed on the project admin page.
        '''
        app = self._get_test_app()
        user_one = factories.User()
        user_two = factories.User()
        user_three = factories.User()

        helpers.call_action('ckanext_project_admin_add', context={},
                            username=user_one['name'])
        helpers.call_action('ckanext_project_admin_add', context={},
                            username=user_two['name'])

        sysadmin = factories.Sysadmin()

        env = {'REMOTE_USER': sysadmin['name'].encode('ascii')}
        response = app.get(url=url_for(controller='ckanext.project.controller:projectController',
                                       action='manage_project_admins'),
                           status=200, extra_environ=env)

        nosetools.assert_true('/user/{0}'.format(user_one['name']) in response)
        nosetools.assert_true('/user/{0}'.format(user_two['name']) in response)
        nosetools.assert_true('/user/{0}'.format(user_three['name']) not in response)

    def test_project_admin_manage_page_no_admins_message(self):
        '''
        project admins page displays message if no project admins present.
        '''
        app = self._get_test_app()

        sysadmin = factories.Sysadmin()

        env = {'REMOTE_USER': sysadmin['name'].encode('ascii')}
        response = app.get(url=url_for(controller='ckanext.project.controller:projectController',
                                       action='manage_project_admins'),
                           status=200, extra_environ=env)

        nosetools.assert_true('There are currently no project Admins' in response)
