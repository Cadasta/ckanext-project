from nose import tools as nosetools

import ckan.plugins.toolkit as toolkit
import ckan.tests.factories as factories
import ckan.tests.helpers as helpers


class TestprojectShow(helpers.FunctionalTestBase):

    def test_project_show_no_args(self):
        '''
        Calling project show with no args raises a ValidationError.
        '''
        nosetools.assert_raises(toolkit.ValidationError, helpers.call_action,
                                'ckanext_project_show')

    def test_project_show_with_id(self):
        '''
        Calling project show with id arg returns project dict.
        '''
        my_project = factories.Dataset(type='project', name='my-project')

        project_shown = helpers.call_action('ckanext_project_show', id=my_project['id'])

        nosetools.assert_equal(my_project['name'], project_shown['name'])

    def test_project_show_with_name(self):
        '''
        Calling project show with name arg returns project dict.
        '''
        my_project = factories.Dataset(type='project', name='my-project')

        project_shown = helpers.call_action('ckanext_project_show', id=my_project['name'])

        nosetools.assert_equal(my_project['id'], project_shown['id'])

    def test_project_show_with_nonexisting_name(self):
        '''
        Calling project show with bad name arg returns ObjectNotFound.
        '''
        factories.Dataset(type='project', name='my-project')

        nosetools.assert_raises(toolkit.ObjectNotFound, helpers.call_action,
                                'ckanext_project_show', id='my-bad-name')

    def test_project_show_num_datasets_added(self):
        '''
        num_datasets property returned with project dict.
        '''
        my_project = factories.Dataset(type='project', name='my-project')

        project_shown = helpers.call_action('ckanext_project_show', id=my_project['name'])

        nosetools.assert_true('num_datasets' in project_shown)
        nosetools.assert_equal(project_shown['num_datasets'], 0)

    def test_project_show_num_datasets_correct_value(self):
        '''
        num_datasets property has correct value.
        '''

        sysadmin = factories.User(sysadmin=True)

        my_project = factories.Dataset(type='project', name='my-project')
        package_one = factories.Dataset()
        package_two = factories.Dataset()

        context = {'user': sysadmin['name']}
        # create an association
        helpers.call_action('ckanext_project_package_association_create',
                            context=context, package_id=package_one['id'],
                            project_id=my_project['id'])
        helpers.call_action('ckanext_project_package_association_create',
                            context=context, package_id=package_two['id'],
                            project_id=my_project['id'])

        project_shown = helpers.call_action('ckanext_project_show', id=my_project['name'])

        nosetools.assert_equal(project_shown['num_datasets'], 2)

    def test_project_show_num_datasets_correct_only_count_active_datasets(self):
        '''
        num_datasets property has correct value when some previously
        associated datasets have been datasets.
        '''
        sysadmin = factories.User(sysadmin=True)

        my_project = factories.Dataset(type='project', name='my-project')
        package_one = factories.Dataset()
        package_two = factories.Dataset()
        package_three = factories.Dataset()

        context = {'user': sysadmin['name']}
        # create the associations
        helpers.call_action('ckanext_project_package_association_create',
                            context=context, package_id=package_one['id'],
                            project_id=my_project['id'])
        helpers.call_action('ckanext_project_package_association_create',
                            context=context, package_id=package_two['id'],
                            project_id=my_project['id'])
        helpers.call_action('ckanext_project_package_association_create',
                            context=context, package_id=package_three['id'],
                            project_id=my_project['id'])

        # delete the first package
        helpers.call_action('package_delete', context=context, id=package_one['id'])

        project_shown = helpers.call_action('ckanext_project_show', id=my_project['name'])

        # the num_datasets should only include active datasets
        nosetools.assert_equal(project_shown['num_datasets'], 2)


class TestprojectList(helpers.FunctionalTestBase):

    def test_project_list(self):
        '''project list action returns names of projects in site.'''

        project_one = factories.Dataset(type='project')
        project_two = factories.Dataset(type='project')
        project_three = factories.Dataset(type='project')

        project_list = helpers.call_action('ckanext_project_list')

        project_list_name_id = [(sc['name'], sc['id']) for sc in project_list]

        nosetools.assert_equal(len(project_list), 3)
        nosetools.assert_true(sorted(project_list_name_id) ==
                              sorted([(project['name'], project['id'])
                                     for project in [project_one,
                                                      project_two,
                                                      project_three]]))

    def test_project_list_no_datasets(self):
        '''
        project list action doesn't return normal datasets (of type
        'dataset').
        '''
        project_one = factories.Dataset(type='project')
        dataset_one = factories.Dataset()
        dataset_two = factories.Dataset()

        project_list = helpers.call_action('ckanext_project_list')

        project_list_name_id = [(sc['name'], sc['id']) for sc in project_list]

        nosetools.assert_equal(len(project_list), 1)
        nosetools.assert_true((project_one['name'], project_one['id']) in project_list_name_id)
        nosetools.assert_true((dataset_one['name'], dataset_one['id']) not in project_list_name_id)
        nosetools.assert_true((dataset_two['name'], dataset_two['id']) not in project_list_name_id)


class TestprojectPackageList(helpers.FunctionalTestBase):

    '''Tests for ckanext_project_package_list'''

    def test_project_package_list_no_packages(self):
        '''
        Calling ckanext_project_package_list with a project that has no
        packages returns an empty list.
        '''
        project_id = factories.Dataset(type='project')['id']

        pkg_list = helpers.call_action('ckanext_project_package_list',
                                       project_id=project_id)

        nosetools.assert_equal(pkg_list, [])

    def test_project_package_list_works_with_name(self):
        '''
        Calling ckanext_project_package_list with a project name doesn't
        raise a ValidationError.
        '''
        project_name = factories.Dataset(type='project')['name']

        pkg_list = helpers.call_action('ckanext_project_package_list',
                                       project_id=project_name)

        nosetools.assert_equal(pkg_list, [])

    def test_project_package_list_wrong_project_id(self):
        '''
        Calling ckanext_project_package_list with a bad project id raises a
        ValidationError.
        '''
        factories.Dataset(type='project')['id']

        nosetools.assert_raises(toolkit.ValidationError, helpers.call_action,
                                'ckanext_project_package_list',
                                project_id='a-bad-id')

    def test_project_package_list_project_has_package(self):
        '''
        Calling ckanext_project_package_list with a project that has a
        package should return that package.
        '''
        sysadmin = factories.User(sysadmin=True)

        package = factories.Dataset()
        project_id = factories.Dataset(type='project')['id']
        context = {'user': sysadmin['name']}
        # create an association
        helpers.call_action('ckanext_project_package_association_create',
                            context=context, package_id=package['id'],
                            project_id=project_id)

        pkg_list = helpers.call_action('ckanext_project_package_list',
                                       project_id=project_id)

        # We've got an item in the pkg_list
        nosetools.assert_equal(len(pkg_list), 1)
        # The list item should have the correct name property
        nosetools.assert_equal(pkg_list[0]['name'], package['name'])

    def test_project_package_list_project_has_two_packages(self):
        '''
        Calling ckanext_project_package_list with a project that has two
        packages should return the packages.
        '''
        sysadmin = factories.User(sysadmin=True)

        package_one = factories.Dataset()
        package_two = factories.Dataset()
        project_id = factories.Dataset(type='project')['id']
        context = {'user': sysadmin['name']}
        # create first association
        helpers.call_action('ckanext_project_package_association_create',
                            context=context, package_id=package_one['id'],
                            project_id=project_id)
        # create second association
        helpers.call_action('ckanext_project_package_association_create',
                            context=context, package_id=package_two['id'],
                            project_id=project_id)

        pkg_list = helpers.call_action('ckanext_project_package_list',
                                       project_id=project_id)

        # We've got two items in the pkg_list
        nosetools.assert_equal(len(pkg_list), 2)

    def test_project_package_list_project_only_contains_active_datasets(self):
        '''
        Calling ckanext_project_package_list will only return active datasets
        (not deleted ones).
        '''
        sysadmin = factories.User(sysadmin=True)

        package_one = factories.Dataset()
        package_two = factories.Dataset()
        package_three = factories.Dataset()
        project_id = factories.Dataset(type='project')['id']
        context = {'user': sysadmin['name']}
        # create first association
        helpers.call_action('ckanext_project_package_association_create',
                            context=context, package_id=package_one['id'],
                            project_id=project_id)
        # create second association
        helpers.call_action('ckanext_project_package_association_create',
                            context=context, package_id=package_two['id'],
                            project_id=project_id)
        # create third association
        helpers.call_action('ckanext_project_package_association_create',
                            context=context, package_id=package_three['id'],
                            project_id=project_id)

        # delete the first package
        helpers.call_action('package_delete', context=context, id=package_one['id'])

        pkg_list = helpers.call_action('ckanext_project_package_list',
                                       project_id=project_id)

        # We've got two items in the pkg_list
        nosetools.assert_equal(len(pkg_list), 2)

        pkg_list_ids = [pkg['id'] for pkg in pkg_list]
        nosetools.assert_true(package_two['id'] in pkg_list_ids)
        nosetools.assert_true(package_three['id'] in pkg_list_ids)
        nosetools.assert_false(package_one['id'] in pkg_list_ids)

    def test_project_package_list_package_isnot_a_project(self):
        '''
        Calling ckanext_project_package_list with a package id should raise a
        ValidationError.

        Since projects are Packages under the hood, make sure we treat them
        differently.
        '''
        sysadmin = factories.User(sysadmin=True)

        package = factories.Dataset()
        project_id = factories.Dataset(type='project')['id']
        context = {'user': sysadmin['name']}
        # create an association
        helpers.call_action('ckanext_project_package_association_create',
                            context=context, package_id=package['id'],
                            project_id=project_id)

        nosetools.assert_raises(toolkit.ValidationError, helpers.call_action,
                                'ckanext_project_package_list',
                                project_id=package['id'])


class TestPackageprojectList(helpers.FunctionalTestBase):

    '''Tests for ckanext_package_project_list'''

    def test_package_project_list_no_projects(self):
        '''
        Calling ckanext_package_project_list with a package that has no
        projects returns an empty list.
        '''
        package_id = factories.Dataset()['id']

        project_list = helpers.call_action('ckanext_package_project_list',
                                            package_id=package_id)

        nosetools.assert_equal(project_list, [])

    def test_package_project_list_works_with_name(self):
        '''
        Calling ckanext_package_project_list with a package name doesn't
        raise a ValidationError.
        '''
        package_name = factories.Dataset()['name']

        project_list = helpers.call_action('ckanext_package_project_list',
                                            package_id=package_name)

        nosetools.assert_equal(project_list, [])

    def test_package_project_list_wrong_project_id(self):
        '''
        Calling ckanext_package_project_list with a bad package id raises a
        ValidationError.
        '''
        factories.Dataset()['id']

        nosetools.assert_raises(toolkit.ValidationError, helpers.call_action,
                                'ckanext_package_project_list',
                                project_id='a-bad-id')

    def test_package_project_list_project_has_package(self):
        '''
        Calling ckanext_package_project_list with a package that has a
        project should return that project.
        '''
        sysadmin = factories.User(sysadmin=True)

        package = factories.Dataset()
        project = factories.Dataset(type='project')
        context = {'user': sysadmin['name']}
        # create an association
        helpers.call_action('ckanext_project_package_association_create',
                            context=context, package_id=package['id'],
                            project_id=project['id'])

        project_list = helpers.call_action('ckanext_package_project_list',
                                            package_id=package['id'])

        # We've got an item in the project_list
        nosetools.assert_equal(len(project_list), 1)
        # The list item should have the correct name property
        nosetools.assert_equal(project_list[0]['name'], project['name'])

    def test_package_project_list_project_has_two_packages(self):
        '''
        Calling ckanext_package_project_list with a package that has two
        projects should return the projects.
        '''
        sysadmin = factories.User(sysadmin=True)

        package = factories.Dataset()
        project_one = factories.Dataset(type='project')
        project_two = factories.Dataset(type='project')
        context = {'user': sysadmin['name']}
        # create first association
        helpers.call_action('ckanext_project_package_association_create',
                            context=context, package_id=package['id'],
                            project_id=project_one['id'])
        # create second association
        helpers.call_action('ckanext_project_package_association_create',
                            context=context, package_id=package['id'],
                            project_id=project_two['id'])

        project_list = helpers.call_action('ckanext_package_project_list',
                                            package_id=package['id'])

        # We've got two items in the project_list
        nosetools.assert_equal(len(project_list), 2)

    def test_package_project_list_package_isnot_a_project(self):
        '''
        Calling ckanext_package_project_list with a project id should raise a
        ValidationError.

        Since projects are Packages under the hood, make sure we treat them
        differently.
        '''
        sysadmin = factories.User(sysadmin=True)

        package = factories.Dataset()
        project = factories.Dataset(type='project')
        context = {'user': sysadmin['name']}
        # create an association
        helpers.call_action('ckanext_project_package_association_create',
                            context=context, package_id=package['id'],
                            project_id=project['id'])

        nosetools.assert_raises(toolkit.ValidationError, helpers.call_action,
                                'ckanext_package_project_list',
                                package_id=project['id'])


class TestprojectAdminList(helpers.FunctionalTestBase):

    '''Tests for ckanext_project_admin_list'''

    def test_project_admin_list_no_project_admins(self):
        '''
        Calling ckanext_project_admin_list on a site that has no projects
        admins returns an empty list.
        '''

        project_admin_list = helpers.call_action('ckanext_project_admin_list')

        nosetools.assert_equal(project_admin_list, [])

    def test_project_admin_list_users(self):
        '''
        Calling ckanext_project_admin_list will return users who are project
        admins.
        '''
        user_one = factories.User()
        user_two = factories.User()
        user_three = factories.User()

        helpers.call_action('ckanext_project_admin_add', context={},
                            username=user_one['name'])
        helpers.call_action('ckanext_project_admin_add', context={},
                            username=user_two['name'])
        helpers.call_action('ckanext_project_admin_add', context={},
                            username=user_three['name'])

        project_admin_list = helpers.call_action('ckanext_project_admin_list', context={})

        nosetools.assert_equal(len(project_admin_list), 3)
        for user in [user_one, user_two, user_three]:
            nosetools.assert_true({'name': user['name'], 'id': user['id']} in project_admin_list)

    def test_project_admin_only_lists_admin_users(self):
        '''
        Calling ckanext_project_admin_list will only return users who are
        project admins.
        '''
        user_one = factories.User()
        user_two = factories.User()
        user_three = factories.User()

        helpers.call_action('ckanext_project_admin_add', context={},
                            username=user_one['name'])
        helpers.call_action('ckanext_project_admin_add', context={},
                            username=user_two['name'])

        project_admin_list = helpers.call_action('ckanext_project_admin_list', context={})

        nosetools.assert_equal(len(project_admin_list), 2)
        # user three isn't in list
        nosetools.assert_true({'name': user_three['name'], 'id': user_three['id']} not in project_admin_list)


class TestPackageSearchBeforeSearch(helpers.FunctionalTestBase):

    '''
    Extension uses the `before_search` method to alter search parameters.
    '''

    def test_package_search_no_additional_filters(self):
        '''
        Perform package_search with no additional filters should not include
        projects.
        '''
        factories.Dataset()
        factories.Dataset()
        factories.Dataset(type='project')
        factories.Dataset(type='custom')

        search_results = helpers.call_action('package_search', context={})['results']

        types = [result['type'] for result in search_results]

        nosetools.assert_equal(len(search_results), 3)
        nosetools.assert_true('project' not in types)
        nosetools.assert_true('custom' in types)

    def test_package_search_filter_include_project(self):
        '''
        package_search filtered to include datasets of type project should
        only include projects.
        '''
        factories.Dataset()
        factories.Dataset()
        factories.Dataset(type='project')
        factories.Dataset(type='custom')

        search_results = helpers.call_action('package_search', context={},
                                             fq='dataset_type:project')['results']

        types = [result['type'] for result in search_results]

        nosetools.assert_equal(len(search_results), 1)
        nosetools.assert_true('project' in types)
        nosetools.assert_true('custom' not in types)
        nosetools.assert_true('dataset' not in types)


# Needs ckan/ckan#2380 to be merged
# class TestUserShowBeforeSearch(helpers.FunctionalTestBase):

#     '''
#     Extension uses the `before_search` method to alter results of user_show
#     (via package_search).
#     '''

#     def test_user_show_no_additional_filters(self):
#         '''
#         Perform package_search with no additional filters should not include
#         projects.
#         '''
#         user = factories.User()
#         factories.Dataset(user=user)
#         factories.Dataset(user=user)
#         factories.Dataset(user=user, type='project')
#         factories.Dataset(user=user, type='custom')

#         search_results = helpers.call_action('user_show', context={},
#                                              include_datasets=True,
#                                              id=user['name'])['datasets']

#         types = [result['type'] for result in search_results]

#         nosetools.assert_equal(len(search_results), 3)
#         nosetools.assert_true('project' not in types)
#         nosetools.assert_true('custom' in types)
