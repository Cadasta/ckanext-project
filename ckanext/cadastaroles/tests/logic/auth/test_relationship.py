import responses
from ckan.tests import helpers, factories
from ckan.lib import search
from ckan.plugins import toolkit
from nose.tools import assert_raises

from .base import TestProjectBase
from ckanext.cadastaroles.tests.helpers import CadastaRolesTestBase



class TestProjectRelationship(TestProjectBase):
    def test_cadasta_get_project_relationship_list(self):
        self.assert_authorization_passes('cadasta_get_project_relationship_list',
                                         [None, 'surveyor', 'admin', 'editor'],
                                         self.project['id'], 'project_id')

    def test_cadasta_get_project_relationship(self):
        self.assert_authorization_passes('cadasta_get_project_relationship_details',
                                         [None, 'surveyor', 'admin', 'editor'],
                                         self.project['id'], 'project_id')

    def test_cadasta_get_project_relationship_detail(self):
        self.assert_authorization_passes('cadasta_get_project_relationship_resources',
                                         [None, 'surveyor', 'admin', 'editor'],
                                         self.project['id'], 'project_id')



    def test_cadasta_create_project_relationship(self):
        self.assert_authorization_passes(
            'cadasta_create_project_relationship',
            ['admin', 'editor'],
            self.project['id'],
            'project_id'
        )

        self.assert_authorization_fails(
            'cadasta_create_project_relationship',
            [None,'surveyor'],
            self.project['id'],
            'project_id'
        )

    def test_cadasta_update_project_relationship(self):
        self.assert_authorization_passes(
            'cadasta_update_project_relationship',
            ['admin', 'editor'],
            self.project['id'],
            'project_id'
        )

        self.assert_authorization_fails(
            'cadasta_update_project_relationship',
            [None,'surveyor'],
            self.project['id'],
            'project_id'
        )