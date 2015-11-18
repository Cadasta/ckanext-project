import responses
from ckan.tests import helpers, factories
from ckan.lib import search
from ckan.plugins import toolkit
from nose.tools import assert_raises

from .base import TestProjectBase
from ckanext.cadastaroles.tests.helpers import CadastaRolesTestBase



class TestProjectFieldData(TestProjectBase):
    def test_cadasta_get_project_fielddata_responses(self):
        self.assert_authorization_passes('cadasta_get_project_fielddata_responses',
                                         [None, 'surveyor', 'admin', 'editor'],
                                         self.project['id'], 'project_id')

    def test_cadasta_get_project_fielddata(self):
        self.assert_authorization_passes('cadasta_get_project_fielddata',
                                         [None, 'surveyor', 'admin', 'editor'],
                                         self.project['id'], 'project_id')



    def test_cadasta_update_project_fielddata_respondents(self):
        self.assert_authorization_passes(
            'cadasta_update_project_fielddata_respondents',
            ['admin'],
            self.project['id'],
            'project_id'
        )

        self.assert_authorization_fails(
            'cadasta_update_project_fielddata_respondents',
            [None,'surveyor','editor'],
            self.project['id'],
            'project_id'
        )

    def test_cadasta_upload_ona_form_sucess(self):
        self.assert_authorization_passes('cadasta_upload_ona_form',
                                         [ 'admin'],
                                         self.project['id'],
                                         'project_id',
                                         **{'resource_type':'project','resource_type_id':'1'})

    def test_cadasta_upload_ona_form_fails(self):
        self.assert_authorization_fails('cadasta_upload_ona_form',
                                         [None,'surveyor','editor'],
                                         self.project['id'],
                                         'project_id',
                                         **{'resource_type':'project','resource_type_id':'1'})