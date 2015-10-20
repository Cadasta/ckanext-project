from nose.tools import assert_equal, assert_raises
import responses
from ckan.tests import helpers
from ckan.lib import search
from ckan.plugins import toolkit


class TestCadastaGetParcel(object):
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
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [
                            [
                                [
                                    -105.228338241577,
                                    21.1714137482368
                                ],
                                [
                                    -105.229024887085,
                                    21.1694127979643
                                ],
                                [
                                    -105.228338241577,
                                    21.1714137482368
                                ]
                            ]
                        ]
                    },
                    "properties": {
                        "id": 1,
                        "spatial_source": 4,
                        "user_id": "1",
                        "area": null,
                        "land_use": null,
                        "gov_pin": null,
                        "active": true,
                        "time_created": "2015-08-06T15:41:26.440037-07:00",
                        "time_updated": null,
                        "created_by": 1,
                        "updated_by": null
                    }
                } ]
            }
        '''
        responses.add(responses.GET, 'http://cadasta.api/parcels/1',
                      body=body,
                      content_type="application/json")

        result = helpers.call_action(
            'cadasta_show_parcel',
            id=1,
            project_id=1,
        )

        assert_equal({
            u'features': [{
                u'geometry': {
                    u'coordinates': [[[-105.228338241577,
                                       21.1714137482368],
                                      [-105.229024887085,
                                       21.1694127979643],
                                      [-105.228338241577,
                                       21.1714137482368]]],
                    u'type': u'Polygon'},
                u'properties': {
                    u'active': True,
                    u'area': None,
                    u'created_by': 1,
                    u'gov_pin': None,
                    u'id': 1,
                    u'land_use': None,
                    u'spatial_source': 4,
                    u'time_created': u'2015-08-06T15:41:26.440037-07:00',
                    u'time_updated': None,
                    u'updated_by': None,
                    u'user_id': u'1'},
                u'type': u'Feature'
            }],
            u'type': u'FeatureCollection'
            },
            result
        )


    @responses.activate
    def test_get_all(self):
        body = '''
            {
                "type": "FeatureCollection",
                "features": [
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [
                            [
                                [
                                    -105.228338241577,
                                    21.1714137482368
                                ],
                                [
                                    -105.229024887085,
                                    21.1694127979643
                                ],
                                [
                                    -105.228338241577,
                                    21.1714137482368
                                ]
                            ]
                        ]
                    },
                    "properties": {
                        "id": 1,
                        "spatial_source": 4,
                        "user_id": "1",
                        "area": null,
                        "land_use": null,
                        "gov_pin": null,
                        "active": true,
                        "time_created": "2015-08-06T15:41:26.440037-07:00",
                        "time_updated": null,
                        "created_by": 1,
                        "updated_by": null
                    }
                }]
            }
        '''
        responses.add(responses.GET, 'http://cadasta.api/parcels',
                      body=body,
                      content_type="application/json")

        result = helpers.call_action(
            'cadasta_show_parcel',
        )

        assert_equal({
            u'features': [{
                u'geometry': {
                    u'coordinates': [[[-105.228338241577,
                                       21.1714137482368],
                                      [-105.229024887085,
                                       21.1694127979643],
                                      [-105.228338241577,
                                       21.1714137482368]]],
                    u'type': u'Polygon'},
                u'properties': {
                    u'active': True,
                    u'area': None,
                    u'created_by': 1,
                    u'gov_pin': None,
                    u'id': 1,
                    u'land_use': None,
                    u'spatial_source': 4,
                    u'time_created': u'2015-08-06T15:41:26.440037-07:00',
                    u'time_updated': None,
                    u'updated_by': None,
                    u'user_id': u'1'},
                u'type': u'Feature'
            }],
            u'type': u'FeatureCollection'},
            result)


class TestParcelDetail(object):
    def teardown(self):
        helpers.reset_db()
        search.clear_all()

    @responses.activate
    def test_get_one(self):
        body = ''' {
            "type": "FeatureCollection",
            "features": [
                {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                    -73.724739,
                    40.588342
                    ]
                },
                "properties": {
                    "id": 1,
                    "spatial_source": 1,
                    "user_id": "11",
                    "area": null,
                    "land_use": null,
                    "gov_pin": null,
                    "active": true,
                    "sys_delete": false,
                    "time_created": "2015-09-01T09:53:16.466337-07:00",
                    "time_updated": null,
                    "created_by": 11,
                    "updated_by": null,
                    "parcel_history": [
                    {
                        "id": 1,
                        "parcel_id": 1,
                        "origin_id": 1,
                        "parent_id": null,
                        "version": 1,
                        "description": "new description",
                        "date_modified": "2015-09-01T07:00:00.000Z",
                        "active": true,
                        "time_created": "2015-09-01T16:53:16.466Z",
                        "time_updated": null,
                        "created_by": 11,
                        "updated_by": null
                    }
                    ],
                    "relationships": [
                    {
                        "id": 1,
                        "parcel_id": 1,
                        "party_id": 1,
                        "geom_id": null,
                        "tenure_type": 1,
                        "acquired_date": null,
                        "how_acquired": null,
                        "active": true,
                        "sys_delete": false,
                        "time_created": "2015-09-01T16:53:16.466Z",
                        "time_updated": null,
                        "created_by": 11,
                        "updated_by": null
                    }
                    ]
                }
                }
            ]
            }
        '''
        responses.add(responses.GET, 'http://cadasta.api/parcels/1/details',
                      body=body,
                      content_type="application/json")

        result = helpers.call_action(
            'cadasta_show_parcel_detail',
            id=1,
            project_id=1,
        )

        assert_equal({
            u'features': [{
                u'geometry': {
                    u'coordinates': [-73.724739, 40.588342],
                    u'type': u'Point'
                },
                u'properties': {
                    u'active': True,
                    u'area': None,
                    u'created_by': 11,
                    u'gov_pin': None,
                    u'id': 1,
                    u'land_use': None,
                    u'parcel_history': [{
                        u'active': True,
                        u'created_by': 11,
                        u'date_modified': u'2015-09-01T07:00:00.000Z',
                        u'description': u'new description',
                        u'id': 1,
                        u'origin_id': 1,
                        u'parcel_id': 1,
                        u'parent_id': None,
                        u'time_created': u'2015-09-01T16:53:16.466Z',
                        u'time_updated': None,
                        u'updated_by': None,
                        u'version': 1}
                    ],
                    u'relationships': [{
                        u'acquired_date': None,
                        u'active': True,
                        u'created_by': 11,
                        u'geom_id': None,
                        u'how_acquired': None,
                        u'id': 1,
                        u'parcel_id': 1,
                        u'party_id': 1,
                        u'sys_delete': False,
                        u'tenure_type': 1,
                        u'time_created': u'2015-09-01T16:53:16.466Z',
                        u'time_updated': None,
                        u'updated_by': None}],
                    u'spatial_source': 1,
                    u'sys_delete': False,
                    u'time_created': u'2015-09-01T09:53:16.466337-07:00',
                    u'time_updated': None,
                    u'updated_by': None,
                    u'user_id': u'11'},
                u'type': u'Feature'}],
            u'type': u'FeatureCollection'},
            result
        )


class TestRelationshipHistory(object):
    def teardown(self):
        helpers.reset_db()
        search.clear_all()

    @responses.activate
    def test_get_one(self):
        body = ''' {
            "type": "FeatureCollection",
            "features": [
                {
                "type": "Feature",
                "geometry": null,
                "properties": {
                    "relationship_id": 1,
                    "origin_id": 1,
                    "version": 1,
                    "parent_id": null,
                    "parcel_id": 1,
                    "expiration_date": null,
                    "description": "History",
                    "date_modified": "2015-09-02",
                    "active": true,
                    "time_created": "2015-09-02T18:09:15.057843+00:00",
                    "time_updated": "2015-09-02T18:09:15.057843+00:00",
                    "created_by": 11,
                    "updated_by": null,
                    "relationship_type": "own",
                    "spatial_source": "survey_sketch",
                    "party_id": 1,
                    "first_name": "Thurmond",
                    "last_name": "Thomas"
                }
                }
            ]
            }
        '''
        responses.add(responses.GET,
                      'http://cadasta.api/parcels/1/show_relationship_history',
                      body=body,
                      content_type="application/json")

        result = helpers.call_action(
            'cadasta_show_parcel_relationship_history',
            id=1,
            fields="test",
            sort_by="test",
            sort_dir="test",
            limit=10,
        )
        expected = {
            u'features': [{
                u'geometry': None,
                u'properties': {
                    u'active': True,
                    u'created_by': 11,
                    u'date_modified': u'2015-09-02',
                    u'description': u'History',
                    u'expiration_date': None,
                    u'first_name': u'Thurmond',
                    u'last_name': u'Thomas',
                    u'origin_id': 1,
                    u'parcel_id': 1,
                    u'parent_id': None,
                    u'party_id': 1,
                    u'relationship_id': 1,
                    u'relationship_type': u'own',
                    u'spatial_source': u'survey_sketch',
                    u'time_created': u'2015-09-02T18:09:15.057843+00:00',
                    u'time_updated': u'2015-09-02T18:09:15.057843+00:00',
                    u'updated_by': None,
                    u'version': 1},
                u'type': u'Feature'}],
            u'type': u'FeatureCollection'}

        assert_equal(expected, result)

    def get_parcel_history_no_id_raises_validation_error(self):
        assert_raises(
            toolkit.ValidationError,

            helpers.call_action,
            'cadasta_show_parcel_relationship_history',
            fields="test",
            sort_by="test",
            sort_dir="test",
            limit=10,
        )


class TestShowParcelResource(object):
    def teardown(self):
        helpers.reset_db()
        search.clear_all()

    @responses.activate
    def test_get_parcel_resource(self):
        body = ''' {
        "type": "FeatureCollection",
        "features": [
        {
        "type": "Feature",
        "geometry": null,
        "properties": {
        "parcel_id": 1,
        "resource_id": 32,
        "type": null,
        "url": "http://www.cadasta.org/32/parcel",
        "description": null,
        "active": true,
        "sys_delete": false,
        "time_created": "2015-09-09T14:57:34.398855-07:00",
        "time_updated": "2015-09-09T14:57:34.398855-07:00",
        "created_by": null,
        "updated_by": null,
        "project_id": 1
        } } ] }
        '''
        responses.add(responses.GET, 'http://cadasta.api/parcels/1/resources',
                      body=body,
                      content_type="application/json")

        result = helpers.call_action(
            'cadasta_show_parcel_resource',
            id=1,
            sort_by='test'
        )

        expected = {
            u'features': [{
                u'geometry': None,
                u'properties': {
                    u'active': True,
                    u'created_by': None,
                    u'description': None,
                    u'parcel_id': 1,
                    u'project_id': 1,
                    u'resource_id': 32,
                    u'sys_delete': False,
                    u'time_created': u'2015-09-09T14:57:34.398855-07:00',
                    u'time_updated': u'2015-09-09T14:57:34.398855-07:00',
                    u'type': None,
                    u'updated_by': None,
                    u'url': u'http://www.cadasta.org/32/parcel'},
                u'type': u'Feature'}],
            u'type': u'FeatureCollection'}
        assert_equal(expected, result)

    def test_no_id_raises_validation_error(self):
        assert_raises(
            toolkit.ValidationError,

            helpers.call_action,
            'cadasta_show_parcel_resource',
            fields="test",
            sort_by="test",
            sort_dir="test",
            limit=10,
        )

