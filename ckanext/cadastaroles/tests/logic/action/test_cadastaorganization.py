from nose.tools import assert_equal, assert_raises
import responses
from ckan.tests import helpers, factories
from ckan.lib import search
from ckan.plugins import toolkit


class TestCadastaGetOrganization(object):
    def teardown(self):
        helpers.reset_db()
        search.clear_all()

    @responses.activate
    def test_get_one(self):
        body = '''
            {
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature",
                        "geometry": null,
                        "properties": {
                            "id": 1,
                            "title": "HFH",
                            "description": null,
                            "ckan_id": null,
                            "active": true,
                            "sys_delete": false,
                            "time_created": "2015-09-08T15:11:11.959406-07:00",
                            "time_updated": "2015-09-08T15:11:11.959406-07:00",
                            "created_by": null,
                            "updated_by": null
                        }
                    }
                ]
            }
        '''
        responses.add(responses.GET, 'http://cadasta.api/organizations/1',
                      body=body,
                      content_type="application/json")

        result = helpers.call_action(
            'cadasta_get_organization',
            id=1,
        )

        assert_equal(
            {
                u'features': [{
                    u'geometry': None,
                    u'properties': {
                        u'active': True,
                        u'ckan_id': None,
                        u'created_by': None,
                        u'description': None,
                        u'id': 1,
                        u'sys_delete': False,
                        u'time_created': u'2015-09-08T15:11:11.959406-07:00',
                        u'time_updated': u'2015-09-08T15:11:11.959406-07:00',
                        u'title': u'HFH',
                        u'updated_by': None},
                    u'type': u'Feature'
                }],
                u'type': u'FeatureCollection'
            },
            result)

    @responses.activate
    def test_get_all(self):
        body = '''
            {
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature",
                        "geometry": null,
                        "properties": {
                            "id": 2,
                            "organization_id": 1,
                            "title": "Medellin Pilot",
                            "ckan_id": "Medellin",
                            "active": true,
                            "sys_delete": false,
                            "time_created": "2015-09-08T15:24:29.278002-07:00",
                            "time_updated": "2015-09-08T15:24:29.278002-07:00",
                            "created_by": null,
                            "updated_by": null
                        }
                    },
                    {
                        "type": "Feature",
                        "geometry": null,
                        "properties": {
                            "id": 3,
                            "organization_id": 1,
                            "title": "Ghana Pilot",
                            "ckan_id": "Ghana",
                            "active": true,
                            "sys_delete": false,
                            "time_created": "2015-09-08T15:24:31.811772-07:00",
                            "time_updated": "2015-09-08T15:24:31.811772-07:00",
                            "created_by": null,
                            "updated_by": null
                        }
                    }
                ]
            }
        '''
        responses.add(responses.GET, 'http://cadasta.api/organizations',
                      body=body,
                      content_type="application/json")

        result = helpers.call_action(
            'cadasta_get_organization',
        )

        assert_equal(
            {u'features': [{
                u'geometry': None,
                u'properties': {
                    u'active': True,
                    u'ckan_id': u'Medellin',
                    u'created_by': None,
                    u'id': 2,
                    u'organization_id': 1,
                    u'sys_delete': False,
                    u'time_created': u'2015-09-08T15:24:29.278002-07:00',
                    u'time_updated': u'2015-09-08T15:24:29.278002-07:00',
                    u'title': u'Medellin Pilot',
                    u'updated_by': None
                },
                u'type': u'Feature'},
                {
                    u'geometry': None,
                    u'properties': {
                        u'active': True,
                        u'ckan_id': u'Ghana',
                        u'created_by': None,
                        u'id': 3,
                        u'organization_id': 1,
                        u'sys_delete': False,
                        u'time_created': u'2015-09-08T15:24:31.811772-07:00',
                        u'time_updated': u'2015-09-08T15:24:31.811772-07:00',
                        u'title': u'Ghana Pilot',
                        u'updated_by': None},
                    u'type': u'Feature'}],
                u'type': u'FeatureCollection'
            },
            result
        )
