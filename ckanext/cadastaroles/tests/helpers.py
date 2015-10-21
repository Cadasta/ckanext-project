from ckan.plugins.core import unload, load


class CadastaRolesTestBase(object):
    @classmethod
    def setup_class(cls):
        unload('project')
        unload('cadasta_organization')

    @classmethod
    def teardown_class(cls):
        load('project')
        load('cadasta_organization')
