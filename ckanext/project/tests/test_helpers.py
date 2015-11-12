# from nose import tools as nosetools
#
# import ckan.tests.helpers as helpers
# import ckan.tests.factories as factories
#
# import ckanext.project.logic.helpers as project_helpers
#
#
# class TestGetSiteStatistics(helpers.FunctionalTestBase):
#
#     def test_dataset_count_no_datasets(self):
#         '''
#         Dataset and project count is 0 when no datasets, and no projects.
#         '''
#         stats = project_helpers.get_site_statistics()
#         nosetools.assert_equal(stats['dataset_count'], 0)
#         nosetools.assert_equal(stats['project_count'], 0)
#
#     def test_dataset_count_no_datasets_some_projects(self):
#         '''
#         Dataset and project count is 0 when no datasets, but some projects.
#         '''
#         for i in xrange(0, 10):
#             factories.Dataset(type='project')
#
#         stats = project_helpers.get_site_statistics()
#         nosetools.assert_equal(stats['dataset_count'], 0)
#         nosetools.assert_equal(stats['project_count'], 10)
#
#     def test_dataset_count_some_datasets_no_projects(self):
#         '''
#         Dataset and project count is correct when there are datasets, but no
#         projects.
#         '''
#         for i in xrange(0, 10):
#             factories.Dataset()
#
#         stats = project_helpers.get_site_statistics()
#         nosetools.assert_equal(stats['dataset_count'], 10)
#         nosetools.assert_equal(stats['project_count'], 0)
#
#     def test_dataset_count_some_datasets_some_projects(self):
#         '''
#         Dataset and project count is correct when there are datasets and some
#         projects.
#         '''
#         for i in xrange(0, 10):
#             factories.Dataset()
#
#         for i in xrange(0, 5):
#             factories.Dataset(type='project')
#
#         stats = project_helpers.get_site_statistics()
#         nosetools.assert_equal(stats['dataset_count'], 10)
#         nosetools.assert_equal(stats['project_count'], 5)
