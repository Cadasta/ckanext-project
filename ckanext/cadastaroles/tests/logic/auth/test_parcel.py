import responses
from ckan.tests import helpers, factories
from ckan.lib import search
from ckan.plugins import toolkit
from nose.tools import assert_raises

from .base import TestProjectBase


class TestCadastaParcel(object):
    def teardown(self):
        helpers.reset_db()
        search.clear_all()

    @responses.activate
    def test_cadasta_show_parcel(self):
        body = '{"test": "test"}'
        user = factories.User()
        responses.add(responses.GET, 'http://cadasta.api/parcels/1',
                      body=body,
                      content_type="application/json")

        context = {'user': user['name'], 'ignore_auth': False}
        helpers.call_action(
            'cadasta_show_parcel',
            context=context,
            id=1,
        )

    def test_cadasta_show_parcel_anon_raises_validation_error(self):
        body = '{"test": "test"}'
        responses.add(responses.GET, 'http://cadasta.api/parcels/1',
                      body=body,
                      content_type="application/json")

        context = {'user': None, 'ignore_auth': False}
        assert_raises(
            toolkit.ValidationError,
            helpers.call_action,
            'cadasta_show_parcel',
            context=context,
            id=1,
        )


class TestProjectParcel(TestProjectBase):
    def test_cadasta_get_project_parcel_list(self):
        self.assert_authorization_passes('cadasta_get_parcels_list',
                                         [None, 'surveyor', 'admin', 'editor'],
                                         self.project['id'], 'id')

    def test_cadasta_get_project_parcel(self):
        self.assert_authorization_passes('cadasta_get_project_parcel',
                                         [None, 'surveyor', 'admin', 'editor'],
                                         self.project['id'], 'id')

    def test_cadasta_get_project_parcel_detail(self):
        self.assert_authorization_passes('cadasta_get_project_parcel_detail',
                                         [None, 'surveyor', 'admin', 'editor'],
                                         self.project['id'], 'id')

    def test_cadasta_get_project_parcel_history(self):
        self.assert_authorization_passes('cadasta_get_project_parcel_history',
                                         [None, 'surveyor', 'admin', 'editor'],
                                         self.project['id'], 'id')

    def test_cadasta_get_project_parcel_relationship_history(self):
        self.assert_authorization_passes(
            'cadasta_get_project_parcel_relationship_history',
            [None, 'surveyor', 'admin', 'editor'],
            self.project['id'],
            'id'
        )
