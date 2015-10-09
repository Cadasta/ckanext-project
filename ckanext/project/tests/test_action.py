from nose.tools import assert_equal, assert_raises
import responses
from ckan.tests import helpers, factories
from ckan.lib import search
from ckan.plugins import toolkit
from ckan import model


class TestOrganizationCreate(object):
    '''Tests that the cadasta organization create

    make sure the cadasta_create_organization is called when
    organization_create is called
    '''
    def teardown(self):
        helpers.reset_db()
        search.clear_all()

    @responses.activate
    def test_create(self):
        responses.add(responses.POST, 'http://cadasta.api/organizations',
                      body='{"cadasta_organization_id": 1}',
                      content_type="application/json")

        user = factories.Sysadmin()
        context = {'user': user['name'],
                   'model': model,
                   'session': model.Session,
        }
        result = helpers.call_action(
            'organization_create',
            context=context,
            title='test title',
            description='descrption',
            name='test'
        )

        assert_equal('1', result['cadasta_id'])
