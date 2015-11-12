# from nose import tools as nosetools
#
# import ckan.model as model
# import ckan.plugins.toolkit as toolkit
# import ckan.tests.factories as factories
# import ckan.tests.helpers as helpers
#
# from ckanext.project.model import projectPackageAssociation, projectAdmin
# from ckan.model.package import Package
# from ckan.model.user import User
#
#
# class TestDeleteproject(helpers.FunctionalTestBase):
#
#     def test_project_delete_no_args(self):
#         '''
#         Calling project delete with no args raises a ValidationError.
#         '''
#         sysadmin = factories.Sysadmin()
#         context = {'user': sysadmin['name']}
#         nosetools.assert_raises(toolkit.ValidationError, helpers.call_action,
#                                 'ckanext_project_delete', context=context)
#
#     def test_project_delete_incorrect_args(self):
#         '''
#         Calling project delete with incorrect args raises ObjectNotFound.
#         '''
#         sysadmin = factories.Sysadmin()
#         context = {'user': sysadmin['name']}
#         factories.Dataset(type='project')
#         nosetools.assert_raises(toolkit.ObjectNotFound, helpers.call_action,
#                                 'ckanext_project_delete', context=context,
#                                 id='blah-blah')
#
#     def test_project_delete_by_id(self):
#         '''
#         Calling project delete with project id.
#         '''
#         sysadmin = factories.Sysadmin()
#         context = {'user': sysadmin['name']}
#         project = factories.Dataset(type='project')
#
#         # One project object created
#         nosetools.assert_equal(model.Session.query(Package)
#                                .filter(Package.type == 'project').count(), 1)
#
#         helpers.call_action('ckanext_project_delete',
#                             context=context, id=project['id'])
#
#         nosetools.assert_equal(model.Session.query(Package)
#                                .filter(Package.type == 'project').count(), 0)
#
#     def test_project_delete_by_name(self):
#         '''
#         Calling project delete with project name.
#         '''
#         sysadmin = factories.Sysadmin()
#         context = {'user': sysadmin['name']}
#         project = factories.Dataset(type='project')
#
#         # One project object created
#         nosetools.assert_equal(model.Session.query(Package)
#                                .filter(Package.type == 'project').count(), 1)
#
#         helpers.call_action('ckanext_project_delete',
#                             context=context, id=project['name'])
#
#         nosetools.assert_equal(model.Session.query(Package)
#                                .filter(Package.type == 'project').count(), 0)
#
#     def test_project_delete_removes_associations(self):
#         '''
#         Deleting a project also deletes associated projectPackageAssociation
#         objects.
#         '''
#         sysadmin = factories.Sysadmin()
#         context = {'user': sysadmin['name']}
#         project = factories.Dataset(type='project', name='my-project')
#         dataset_one = factories.Dataset(name='dataset-one')
#         dataset_two = factories.Dataset(name='dataset-two')
#
#         helpers.call_action('ckanext_project_package_association_create',
#                             context=context, package_id=dataset_one['id'],
#                             project_id=project['id'])
#         helpers.call_action('ckanext_project_package_association_create',
#                             context=context, package_id=dataset_two['id'],
#                             project_id=project['id'])
#
#         nosetools.assert_equal(model.Session.query(projectPackageAssociation).count(), 2)
#
#         helpers.call_action('ckanext_project_delete',
#                             context=context, id=project['id'])
#
#         nosetools.assert_equal(model.Session.query(projectPackageAssociation).count(), 0)
#
#
# class TestDeletePackage(helpers.FunctionalTestBase):
#
#     def test_package_delete_retains_associations(self):
#         '''
#         Deleting a package (setting its status to 'delete') retains associated
#         projectPackageAssociation objects.
#         '''
#         sysadmin = factories.Sysadmin()
#         context = {'user': sysadmin['name']}
#         project = factories.Dataset(type='project', name='my-project')
#         dataset_one = factories.Dataset(name='dataset-one')
#         dataset_two = factories.Dataset(name='dataset-two')
#
#         helpers.call_action('ckanext_project_package_association_create',
#                             context=context, package_id=dataset_one['id'],
#                             project_id=project['id'])
#         helpers.call_action('ckanext_project_package_association_create',
#                             context=context, package_id=dataset_two['id'],
#                             project_id=project['id'])
#
#         nosetools.assert_equal(model.Session.query(projectPackageAssociation).count(), 2)
#
#         # delete the first package, should also delete the
#         # projectPackageAssociation associated with it.
#         helpers.call_action('package_delete',
#                             context=context, id=dataset_one['id'])
#
#         nosetools.assert_equal(model.Session.query(projectPackageAssociation).count(), 2)
#
#     def test_package_purge_deletes_associations(self):
#         '''
#         Purging a package (actually deleting it from the database) deletes
#         associated projectPackageAssociation objects.
#         '''
#         sysadmin = factories.Sysadmin()
#         context = {'user': sysadmin['name']}
#         project = factories.Dataset(type='project', name='my-project')
#         dataset_one = factories.Dataset(name='dataset-one')
#         dataset_two = factories.Dataset(name='dataset-two')
#
#         helpers.call_action('ckanext_project_package_association_create',
#                             context=context, package_id=dataset_one['id'],
#                             project_id=project['id'])
#         helpers.call_action('ckanext_project_package_association_create',
#                             context=context, package_id=dataset_two['id'],
#                             project_id=project['id'])
#
#         nosetools.assert_equal(model.Session.query(projectPackageAssociation).count(), 2)
#
#         # purge the first package, should also delete the
#         # projectPackageAssociation associated with it.
#         pkg = model.Session.query(model.Package).get(dataset_one['id'])
#         pkg.purge()
#         model.repo.commit_and_remove()
#
#         nosetools.assert_equal(model.Session.query(projectPackageAssociation).count(), 1)
#
#
# class TestDeleteprojectPackageAssociation(helpers.FunctionalTestBase):
#
#     def test_association_delete_no_args(self):
#         '''
#         Calling sc/pkg association delete with no args raises ValidationError.
#         '''
#         sysadmin = factories.User(sysadmin=True)
#         context = {'user': sysadmin['name']}
#         nosetools.assert_raises(toolkit.ValidationError, helpers.call_action,
#                                 'ckanext_project_package_association_delete',
#                                 context=context)
#
#     def test_association_delete_missing_arg(self):
#         '''
#         Calling sc/pkg association delete with a missing arg raises
#         ValidationError.
#         '''
#         sysadmin = factories.User(sysadmin=True)
#         package_id = factories.Dataset()['id']
#
#         context = {'user': sysadmin['name']}
#         nosetools.assert_raises(toolkit.ValidationError, helpers.call_action,
#                                 'ckanext_project_package_association_delete',
#                                 context=context, package_id=package_id)
#
#     def test_association_delete_by_id(self):
#         '''
#         Calling sc/pkg association delete with correct args (package ids)
#         correctly deletes an association.
#         '''
#         sysadmin = factories.User(sysadmin=True)
#         package_id = factories.Dataset()['id']
#         project_id = factories.Dataset(type='project')['id']
#
#         context = {'user': sysadmin['name']}
#         helpers.call_action('ckanext_project_package_association_create',
#                             context=context, package_id=package_id,
#                             project_id=project_id)
#
#         # One association object created
#         nosetools.assert_equal(model.Session.query(projectPackageAssociation).count(), 1)
#
#         helpers.call_action('ckanext_project_package_association_delete',
#                             context=context, package_id=package_id,
#                             project_id=project_id)
#
#     def test_association_delete_attempt_with_non_existent_association(self):
#         '''
#         Attempting to delete a non-existent association (package ids exist,
#         but aren't associated with each other), will cause a NotFound error.
#         '''
#         sysadmin = factories.User(sysadmin=True)
#         package_id = factories.Dataset()['id']
#         project_id = factories.Dataset(type='project')['id']
#
#         # No existing associations
#         nosetools.assert_equal(model.Session.query(projectPackageAssociation).count(), 0)
#
#         context = {'user': sysadmin['name']}
#         nosetools.assert_raises(toolkit.ObjectNotFound, helpers.call_action,
#                                 'ckanext_project_package_association_delete',
#                                 context=context, package_id=package_id,
#                                 project_id=project_id)
#
#     def test_association_delete_attempt_with_bad_package_ids(self):
#         '''
#         Attempting to delete an association by passing non-existent package
#         ids will cause a ValidationError.
#         '''
#         sysadmin = factories.User(sysadmin=True)
#
#         # No existing associations
#         nosetools.assert_equal(model.Session.query(projectPackageAssociation).count(), 0)
#
#         context = {'user': sysadmin['name']}
#         nosetools.assert_raises(toolkit.ValidationError, helpers.call_action,
#                                 'ckanext_project_package_association_delete',
#                                 context=context, package_id="my-bad-package-id",
#                                 project_id="my-bad-project-id")
#
#     def test_association_delete_retains_packages(self):
#         '''
#         Deleting a sc/pkg association doesn't delete the associated packages.
#         '''
#         sysadmin = factories.User(sysadmin=True)
#         package_id = factories.Dataset()['id']
#         project_id = factories.Dataset(type='project')['id']
#
#         context = {'user': sysadmin['name']}
#         helpers.call_action('ckanext_project_package_association_create',
#                             context=context, package_id=package_id,
#                             project_id=project_id)
#
#         helpers.call_action('ckanext_project_package_association_delete',
#                             context=context, package_id=package_id,
#                             project_id=project_id)
#
#         # package still exist
#         nosetools.assert_equal(model.Session.query(Package)
#                                .filter(Package.type == 'dataset').count(), 1)
#
#         # project still exist
#         nosetools.assert_equal(model.Session.query(Package)
#                                .filter(Package.type == 'project').count(), 1)
#
#
# class TestRemoveprojectAdmin(helpers.FunctionalTestBase):
#
#     def test_project_admin_remove_deletes_project_admin_user(self):
#         '''
#         Calling ckanext_project_admin_remove deletes projectAdmin object.
#         '''
#         user = factories.User()
#
#         helpers.call_action('ckanext_project_admin_add', context={},
#                             username=user['name'])
#
#         # There's a projectAdmin obj
#         nosetools.assert_equal(model.Session.query(projectAdmin).count(), 1)
#
#         helpers.call_action('ckanext_project_admin_remove', context={},
#                             username=user['name'])
#
#         # There's no projectAdmin obj
#         nosetools.assert_equal(model.Session.query(projectAdmin).count(), 0)
#         nosetools.assert_equal(projectAdmin.get_project_admin_ids(), [])
#
#     def test_project_admin_delete_user_removes_project_admin_object(self):
#         '''
#         Deleting a user also deletes the corresponding projectAdmin object.
#         '''
#         user = factories.User()
#
#         helpers.call_action('ckanext_project_admin_add', context={},
#                             username=user['name'])
#
#         # There's a projectAdmin object
#         nosetools.assert_equal(model.Session.query(projectAdmin).count(), 1)
#         nosetools.assert_true(user['id'] in projectAdmin.get_project_admin_ids())
#
#         # purge the user, should also delete the projectAdmin object
#         # associated with it.
#         user_obj = model.Session.query(model.User).get(user['id'])
#         user_obj.purge()
#         model.repo.commit_and_remove()
#
#         # The projectAdmin has also been removed
#         nosetools.assert_equal(model.Session.query(projectAdmin).count(), 0)
#         nosetools.assert_equal(projectAdmin.get_project_admin_ids(), [])
#
#     def test_project_admin_remove_retains_user(self):
#         '''
#         Deleting a projectAdmin object doesn't delete the corresponding user.
#         '''
#
#         user = factories.User()
#
#         helpers.call_action('ckanext_project_admin_add', context={},
#                             username=user['name'])
#
#         # We have a user
#         user_obj = model.Session.query(model.User).get(user['id'])
#         nosetools.assert_true(user_obj is not None)
#
#         helpers.call_action('ckanext_project_admin_remove', context={},
#                             username=user['name'])
#
#         # We still have a user
#         user_obj = model.Session.query(model.User).get(user['id'])
#         nosetools.assert_true(user_obj is not None)
#
#     def test_project_admin_remove_with_bad_username(self):
#         '''
#         Calling project admin remove with a non-existent user raises
#         ValidationError.
#         '''
#
#         nosetools.assert_raises(toolkit.ValidationError, helpers.call_action,
#                                 'ckanext_project_admin_remove', context={},
#                                 username='no-one-here')
#
#     def test_project_admin_remove_with_no_args(self):
#         '''
#         Calling project admin remove with no arg raises ValidationError.
#         '''
#
#         nosetools.assert_raises(toolkit.ValidationError, helpers.call_action,
#                                 'ckanext_project_admin_remove', context={})
