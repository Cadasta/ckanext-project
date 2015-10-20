from nose.tools import assert_equal
import responses
from ckan.tests import helpers
from ckan.lib import search


class TestCadastaShowRelationship(object):
    def teardown(self):
        helpers.reset_db()
        search.clear_all()

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
        "id": 1,
        "project_id": 1,
        "parcel_id": 1,
        "party_id": 1,
        "geom_id": null,
        "tenure_type": 1,
        "acquired_date": "2015-08-03",
        "how_acquired": "lease",
        "active": true,
        "sys_delete": false,
        "time_created": "2015-09-08T15:15:37.470562-07:00",
        "time_updated": "2015-09-08T15:15:37.470562-07:00",
        "created_by": 11,
        "updated_by": null
        }
        }
        ]
        }
        '''
        responses.add(responses.GET, 'http://cadasta.api/relationships',
                      body=body,
                      content_type="application/json")

        result = helpers.call_action('cadasta_show_relationship')

        expected = {u'features': [{
            u'geometry': None,
            u'properties': {
                u'acquired_date': u'2015-08-03',
                u'active': True,
                u'created_by': 11,
                u'geom_id': None,
                u'how_acquired': u'lease',
                u'id': 1,
                u'parcel_id': 1,
                u'party_id': 1,
                u'project_id': 1,
                u'sys_delete': False,
                u'tenure_type': 1,
                u'time_created': u'2015-09-08T15:15:37.470562-07:00',
                u'time_updated': u'2015-09-08T15:15:37.470562-07:00',
                u'updated_by': None},
            u'type': u'Feature'}],
            u'type': u'FeatureCollection'
        }
        assert_equal(expected, result)
