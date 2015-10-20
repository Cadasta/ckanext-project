from nose.tools import assert_raises
from ckan.tests import helpers, factories
from ckan.lib import search
from ckan.plugins import toolkit


class TestCadastaCreateOrganization(object):
    def teardown(self):
        helpers.reset_db()
        search.clear_all()

    def test_create_as_anonymous_user_fails(self):
        organization = factories.Organization(id='1')

        context = {'user': None, 'ignore_auth': False}
        assert_raises(
            toolkit.NotAuthorized,
            helpers.call_action,
            'cadasta_create_organization',
            context=context,
            ckan_id=organization['id'],
            ckan_title=organization['title'],
            ckan_description=organization['description'],
        )

    def test_create_as_logged_in_user_fails(self):
        organization = factories.Organization(id='1')

        context = {'user': factories.User()['name'], 'ignore_auth': False}
        assert_raises(
            toolkit.NotAuthorized,
            helpers.call_action,
            'cadasta_create_organization',
            context=context,
            ckan_id=organization['id'],
            ckan_title=organization['title'],
            ckan_description=organization['description'],
        )

    def test_create_as_org_admin(self):
        user = factories.User()
        organization = factories.Organization(
            id='1',
            users=[{
                'name': user['name'],
                'capacity': 'community_admin',
            }]
        )
        context = {'user': user['name'], 'ignore_auth': False}
        assert_raises(
            toolkit.NotAuthorized,
            helpers.call_action,
            'cadasta_create_organization',
            context=context,
            ckan_id=organization['id'],
            ckan_title=organization['title'],
            ckan_description=organization['description'],
        )

    def test_create_as_community_user(self):
        user = factories.User()
        organization = factories.Organization(
            id='1',
            users=[{
                'name': user['name'],
                'capacity': 'community_user',
            }]
        )
        context = {'user': user['name'], 'ignore_auth': False}
        assert_raises(
            toolkit.NotAuthorized,
            helpers.call_action,
            'cadasta_create_organization',
            context=context,
            ckan_id=organization['id'],
            ckan_title=organization['title'],
            ckan_description=organization['description'],
        )

    def test_create_as_surveyor(self):
        user = factories.User()
        organization = factories.Organization(
            id='1',
            users=[{
                'name': user['name'],
                'capacity': 'community_user',
            }]
        )
        context = {'user': user['name'], 'ignore_auth': False}
        assert_raises(
            toolkit.NotAuthorized,
            helpers.call_action,
            'cadasta_create_organization',
            context=context,
            ckan_id=organization['id'],
            ckan_title=organization['title'],
            ckan_description=organization['description'],
        )
