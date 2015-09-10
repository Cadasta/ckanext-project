from nose import tools as nosetools

from ckan.model.package import Package
import ckan.model as model
import ckan.plugins.toolkit as toolkit
import ckan.tests.factories as factories
import ckan.tests.helpers as helpers

from ckanext.project.model import projectPackageAssociation, projectAdmin


class TestCreateproject(helpers.FunctionalTestBase):

    def test_project_create_no_args(self):
        '''
        Calling project create without args raises ValidationError.
        '''
        sysadmin = factories.Sysadmin()
        context = {'user': sysadmin['name']}

        # no projects exist.
        nosetools.assert_equal(model.Session.query(Package)
                               .filter(Package.type == 'project').count(), 0)

        nosetools.assert_raises(toolkit.ValidationError, helpers.call_action,
                                'ckanext_project_create',
                                context=context)

        # no projects (dataset of type 'project') created.
        nosetools.assert_equal(model.Session.query(Package)
                               .filter(Package.type == 'project').count(), 0)

    def test_project_create_with_name_arg(self):
        '''
        Calling project create with a name arg creates a project package.
        '''
        sysadmin = factories.Sysadmin()
        context = {'user': sysadmin['name']}

        # no projects exist.
        nosetools.assert_equal(model.Session.query(Package)
                               .filter(Package.type == 'project').count(), 0)

        helpers.call_action('ckanext_project_create',
                            context=context, name='my-project')

        # a projects (dataset of type 'project') created.
        nosetools.assert_equal(model.Session.query(Package)
                               .filter(Package.type == 'project').count(), 1)

    def test_project_create_with_existing_name(self):
        '''
        Calling project create with an existing name raises ValidationError.
        '''
        sysadmin = factories.Sysadmin()
        context = {'user': sysadmin['name']}
        factories.Dataset(type='project', name='my-project')

        # a single projects exist.
        nosetools.assert_equal(model.Session.query(Package)
                               .filter(Package.type == 'project').count(), 1)

        nosetools.assert_raises(toolkit.ValidationError, helpers.call_action,
                                'ckanext_project_create',
                                context=context, name='my-project')

        # still only one project exists.
        nosetools.assert_equal(model.Session.query(Package)
                               .filter(Package.type == 'project').count(), 1)


class TestCreateprojectPackageAssociation(helpers.FunctionalTestBase):

    def test_association_create_no_args(self):
        '''
        Calling sc/pkg association create with no args raises
        ValidationError.
        '''
        sysadmin = factories.User(sysadmin=True)
        context = {'user': sysadmin['name']}
        nosetools.assert_raises(toolkit.ValidationError, helpers.call_action,
                                'ckanext_project_package_association_create',
                                context=context)

        nosetools.assert_equal(model.Session.query(projectPackageAssociation).count(), 0)

    def test_association_create_missing_arg(self):
        '''
        Calling sc/pkg association create with a missing arg raises
        ValidationError.
        '''
        sysadmin = factories.User(sysadmin=True)
        package_id = factories.Dataset()['id']

        context = {'user': sysadmin['name']}
        nosetools.assert_raises(toolkit.ValidationError, helpers.call_action,
                                'ckanext_project_package_association_create',
                                context=context, package_id=package_id)

        nosetools.assert_equal(model.Session.query(projectPackageAssociation).count(), 0)

    def test_association_create_by_id(self):
        '''
        Calling sc/pkg association create with correct args (package ids)
        creates an association.
        '''
        sysadmin = factories.User(sysadmin=True)
        package_id = factories.Dataset()['id']
        project_id = factories.Dataset(type='project')['id']

        context = {'user': sysadmin['name']}
        association_dict = helpers.call_action('ckanext_project_package_association_create',
                                               context=context, package_id=package_id,
                                               project_id=project_id)

        # One association object created
        nosetools.assert_equal(model.Session.query(projectPackageAssociation).count(), 1)
        # Association properties are correct
        nosetools.assert_equal(association_dict.get('project_id'), project_id)
        nosetools.assert_equal(association_dict.get('package_id'), package_id)

    def test_association_create_by_name(self):
        '''
        Calling sc/pkg association create with correct args (package names)
        creates an association.
        '''
        sysadmin = factories.User(sysadmin=True)
        package = factories.Dataset()
        package_name = package['name']
        project = factories.Dataset(type='project')
        project_name = project['name']

        context = {'user': sysadmin['name']}
        association_dict = helpers.call_action('ckanext_project_package_association_create',
                                               context=context, package_id=package_name,
                                               project_id=project_name)

        nosetools.assert_equal(model.Session.query(projectPackageAssociation).count(), 1)
        nosetools.assert_equal(association_dict.get('project_id'), project['id'])
        nosetools.assert_equal(association_dict.get('package_id'), package['id'])

    def test_association_create_existing(self):
        '''
        Attempt to create association with existing details returns Validation
        Error.
        '''
        sysadmin = factories.User(sysadmin=True)
        package_id = factories.Dataset()['id']
        project_id = factories.Dataset(type='project')['id']

        context = {'user': sysadmin['name']}
        # Create association
        helpers.call_action('ckanext_project_package_association_create',
                            context=context, package_id=package_id,
                            project_id=project_id)
        # Attempted duplicate creation results in ValidationError
        nosetools.assert_raises(toolkit.ValidationError, helpers.call_action,
                                'ckanext_project_package_association_create',
                                context=context, package_id=package_id,
                                project_id=project_id)


class TestCreateprojectAdmin(helpers.FunctionalTestBase):

    def test_project_admin_add_creates_project_admin_user(self):
        '''
        Calling ckanext_project_admin_add adds user to project admin list.
        '''
        user_to_add = factories.User()

        nosetools.assert_equal(model.Session.query(projectAdmin).count(), 0)

        helpers.call_action('ckanext_project_admin_add', context={},
                            username=user_to_add['name'])

        nosetools.assert_equal(model.Session.query(projectAdmin).count(), 1)
        nosetools.assert_true(user_to_add['id'] in projectAdmin.get_project_admin_ids())

    def test_project_admin_add_multiple_users(self):
        '''
        Calling ckanext_project_admin_add for multiple users correctly adds
        them to project admin list.
        '''
        user_to_add = factories.User()
        second_user_to_add = factories.User()

        nosetools.assert_equal(model.Session.query(projectAdmin).count(), 0)

        helpers.call_action('ckanext_project_admin_add', context={},
                            username=user_to_add['name'])

        helpers.call_action('ckanext_project_admin_add', context={},
                            username=second_user_to_add['name'])

        nosetools.assert_equal(model.Session.query(projectAdmin).count(), 2)
        nosetools.assert_true(user_to_add['id'] in projectAdmin.get_project_admin_ids())
        nosetools.assert_true(second_user_to_add['id'] in projectAdmin.get_project_admin_ids())

    def test_project_admin_add_existing_user(self):
        '''
        Calling ckanext_project_admin_add twice for same user raises a
        ValidationError.
        '''
        user_to_add = factories.User()

        # Add once
        helpers.call_action('ckanext_project_admin_add', context={},
                            username=user_to_add['name'])

        nosetools.assert_equal(model.Session.query(projectAdmin).count(), 1)

        # Attempt second add
        nosetools.assert_raises(toolkit.ValidationError, helpers.call_action,
                                'ckanext_project_admin_add', context={},
                                username=user_to_add['name'])

        # Still only one projectAdmin object.
        nosetools.assert_equal(model.Session.query(projectAdmin).count(), 1)

    def test_project_admin_add_username_doesnot_exist(self):
        '''
        Calling ckanext_project_admin_add with non-existent username raises
        ValidationError and no projectAdmin object is created.
        '''
        nosetools.assert_raises(toolkit.ObjectNotFound, helpers.call_action,
                                'ckanext_project_admin_add', context={},
                                username='missing')

        nosetools.assert_equal(model.Session.query(projectAdmin).count(), 0)
        nosetools.assert_equal(projectAdmin.get_project_admin_ids(), [])

    def test_project_admin_add_no_args(self):
        '''
        Calling ckanext_project_admin_add with no args raises ValidationError
        and no projectAdmin object is created.
        '''
        nosetools.assert_raises(toolkit.ValidationError, helpers.call_action,
                                'ckanext_project_admin_add', context={})

        nosetools.assert_equal(model.Session.query(projectAdmin).count(), 0)
        nosetools.assert_equal(projectAdmin.get_project_admin_ids(), [])
